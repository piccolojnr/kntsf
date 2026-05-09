<?php

use App\Enums\NfcCardStatus;
use App\Enums\PermitStatus;
use App\Enums\VerificationResult;
use App\Models\AcademicPeriod;
use App\Models\NfcCard;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Models\VerificationLog;
use App\Support\NfcUidHasher;
use App\Support\PermitCodeHasher;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function nfcUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function activePermitForStudent(Student $student): Permit
{
    $period = AcademicPeriod::factory()->active()->create();
    $code = fake()->unique()->bothify('KNT-NFC-####');

    return Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'code_hash' => app(PermitCodeHasher::class)->hash($code),
        'code_last4' => mb_substr($code, -4),
        'status' => PermitStatus::Active,
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDays(30),
    ]);
}

test('authorized user can register NFC card', function () {
    $student = Student::factory()->create();
    $user = nfcUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('nfc-cards.store'), [
            'student_id' => $student->id,
            'uid' => '04:A1:B2:C3:D4',
        ])
        ->assertRedirect();

    $card = NfcCard::query()->firstOrFail();

    expect($card->student_id)->toBe($student->id)
        ->and($card->created_by_id)->toBe($user->id)
        ->and($card->status)->toBe(NfcCardStatus::Active);
});

test('unauthorized user cannot register NFC card', function () {
    $student = Student::factory()->create();

    $this->actingAs(nfcUserWithRole('student'))
        ->post(route('nfc-cards.store'), [
            'student_id' => $student->id,
            'uid' => '04:A1:B2:C3:D5',
        ])
        ->assertForbidden();
});

test('raw UID is not stored and hash plus last four are stored', function () {
    $student = Student::factory()->create();
    $uid = '04:A1:B2:C3:D6';

    $this->actingAs(nfcUserWithRole('admin'))
        ->post(route('nfc-cards.store'), [
            'student_id' => $student->id,
            'uid' => $uid,
        ])
        ->assertRedirect();

    $card = NfcCard::query()->firstOrFail();

    expect($card->uid_hash)->toBe(app(NfcUidHasher::class)->hash($uid))
        ->and($card->uid_hash)->not->toBe($uid)
        ->and($card->uid_last4)->toBe('C3D6');
});

test('duplicate active UID is rejected', function () {
    $student = Student::factory()->create();
    $uid = '04:A1:B2:C3:D7';

    $this->actingAs(nfcUserWithRole('admin'))
        ->post(route('nfc-cards.store'), [
            'student_id' => $student->id,
            'uid' => $uid,
        ])
        ->assertRedirect();

    $this->actingAs(nfcUserWithRole('admin'))
        ->from(route('nfc-cards.index'))
        ->post(route('nfc-cards.store'), [
            'student_id' => Student::factory()->create()->id,
            'uid' => $uid,
        ])
        ->assertRedirect(route('nfc-cards.index'))
        ->assertSessionHasErrors('uid');

    expect(NfcCard::query()->count())->toBe(1);
});

test('one student cannot have two active cards', function () {
    $student = Student::factory()->create();

    $this->actingAs(nfcUserWithRole('admin'))
        ->post(route('nfc-cards.store'), [
            'student_id' => $student->id,
            'uid' => '04:A1:B2:C3:D8',
        ])
        ->assertRedirect();

    $this->actingAs(nfcUserWithRole('admin'))
        ->post(route('nfc-cards.store'), [
            'student_id' => $student->id,
            'uid' => '04:A1:B2:C3:D9',
        ])
        ->assertRedirect();

    expect($student->nfcCards()->where('status', NfcCardStatus::Active)->count())->toBe(1)
        ->and($student->nfcCards()->where('status', NfcCardStatus::Replaced)->count())->toBe(1);
});

test('replacing card marks previous as replaced', function () {
    $card = NfcCard::factory()->create();

    $this->actingAs(nfcUserWithRole('admin'))
        ->post(route('nfc-cards.replace', $card), [
            'uid' => '04:A1:B2:C3:E1',
        ])
        ->assertRedirect();

    expect($card->refresh()->status)->toBe(NfcCardStatus::Replaced)
        ->and($card->replaced_at)->not->toBeNull()
        ->and($card->student->nfcCards()->where('status', NfcCardStatus::Active)->count())->toBe(1);
});

test('lost card cannot verify as valid', function () {
    $student = Student::factory()->create();
    activePermitForStudent($student);
    NfcCard::factory()->lost()->create([
        'student_id' => $student->id,
        'uid_hash' => app(NfcUidHasher::class)->hash('04:A1:B2:C3:E2'),
        'uid_last4' => 'C3E2',
    ]);

    $this->actingAs(nfcUserWithRole('staff'))
        ->post(route('verification.nfc'), [
            'uid' => '04:A1:B2:C3:E2',
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::CardInactive->value);
});

test('revoked card cannot verify as valid', function () {
    $student = Student::factory()->create();
    activePermitForStudent($student);
    NfcCard::factory()->revoked()->create([
        'student_id' => $student->id,
        'uid_hash' => app(NfcUidHasher::class)->hash('04:A1:B2:C3:E3'),
        'uid_last4' => 'C3E3',
    ]);

    $this->actingAs(nfcUserWithRole('staff'))
        ->post(route('verification.nfc'), [
            'uid' => '04:A1:B2:C3:E3',
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::CardInactive->value);
});

test('NFC verification logs hashed identifier only', function () {
    $student = Student::factory()->create();
    activePermitForStudent($student);
    $uid = '04:A1:B2:C3:E4';
    NfcCard::factory()->create([
        'student_id' => $student->id,
        'uid_hash' => app(NfcUidHasher::class)->hash($uid),
        'uid_last4' => 'C3E4',
    ]);

    $this->actingAs(nfcUserWithRole('staff'))
        ->post(route('verification.nfc'), [
            'uid' => $uid,
        ])
        ->assertRedirect();

    $log = VerificationLog::query()->firstOrFail();

    expect($log->identifier_hash)->toBe(app(NfcUidHasher::class)->hash($uid))
        ->and($log->identifier_hash)->not->toBe($uid)
        ->and(json_encode($log->metadata))->not->toContain($uid)
        ->and($log->reason)->not->toContain($uid);
});

test('NFC verification returns valid when active card and valid permit exist', function () {
    $student = Student::factory()->create();
    $permit = activePermitForStudent($student);
    $uid = '04:A1:B2:C3:E5';
    NfcCard::factory()->create([
        'student_id' => $student->id,
        'uid_hash' => app(NfcUidHasher::class)->hash($uid),
        'uid_last4' => 'C3E5',
    ]);

    $this->actingAs(nfcUserWithRole('staff'))
        ->post(route('verification.nfc'), [
            'uid' => $uid,
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::Valid->value)
        ->assertSessionHas('verificationResult.permit.id', $permit->id);
});
