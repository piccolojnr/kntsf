<?php

use App\Enums\NfcCardStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\PermitStatus;
use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\AcademicPeriod;
use App\Models\NfcCard;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\User;
use App\Models\VerificationLog;
use App\Support\PermitSettings;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function (): void {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function aggregateMobileUser(string $role = 'staff'): User
{
    $user = User::factory()->create([
        'password' => Hash::make('Password123!'),
    ]);
    $user->assignRole($role);

    return $user;
}

function aggregateMobileToken(User $user): string
{
    return $user->createToken('test-mobile', ['mobile'])->plainTextToken;
}

test('unauthorized users cannot access operations summary', function () {
    $user = User::factory()->create();

    $this->withToken(aggregateMobileToken($user))
        ->getJson('/api/mobile/operations/summary')
        ->assertForbidden();
});

test('staff can access operations summary', function () {
    $students = Student::factory()->count(2)->create();
    Permit::factory()->create([
        'student_id' => $students->first()->id,
        'status' => PermitStatus::Active,
    ]);
    NfcCard::factory()->create([
        'student_id' => $students->last()->id,
        'status' => NfcCardStatus::Active,
    ]);
    VerificationLog::factory()->create([
        'result' => VerificationResult::Invalid,
        'created_at' => now(),
    ]);
    PermitRequest::factory()->create([
        'student_id' => $students->first()->id,
        'status' => PermitRequestStatus::AwaitingPayment,
    ]);
    PermitRequest::factory()->create([
        'student_id' => $students->last()->id,
        'status' => PermitRequestStatus::Paid,
    ]);

    $this->withToken(aggregateMobileToken(aggregateMobileUser('staff')))
        ->getJson('/api/mobile/operations/summary')
        ->assertOk()
        ->assertJsonPath('data.total_students', 2)
        ->assertJsonPath('data.active_permits', 1)
        ->assertJsonPath('data.active_nfc_cards', 1)
        ->assertJsonPath('data.verifications_today', 1)
        ->assertJsonPath('data.failed_verifications_today', 1)
        ->assertJsonPath('data.pending_permit_requests', 1);
});

test('nfc cards list hides uid hash and paginates', function () {
    $student = Student::factory()->create([
        'student_number' => '26102859',
        'name' => 'NFC Student',
    ]);
    $card = NfcCard::factory()->create([
        'student_id' => $student->id,
        'uid_hash' => 'sensitive-uid-hash',
        'uid_last4' => 'A1B2',
        'status' => NfcCardStatus::Active,
    ]);
    NfcCard::factory()->lost()->create();

    $response = $this->withToken(aggregateMobileToken(aggregateMobileUser('staff')))
        ->getJson('/api/mobile/operations/nfc-cards?status=active&search=2610&per_page=1')
        ->assertOk()
        ->assertJsonStructure(['data', 'links', 'meta'])
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $card->id)
        ->assertJsonPath('data.0.uid_last4', 'A1B2')
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonMissingPath('data.0.uid_hash');

    expect($response->getContent())->not->toContain('sensitive-uid-hash');
});

test('permits list hides code hash and filters by status academic period and search', function () {
    $period = AcademicPeriod::factory()->create();
    $student = Student::factory()->create([
        'student_number' => '26109999',
        'name' => 'Permit Student',
    ]);
    $permit = Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'code_hash' => 'sensitive-code-hash',
        'code_last4' => '9Z8Y',
        'status' => PermitStatus::Active,
    ]);
    Permit::factory()->revoked()->create();

    $response = $this->withToken(aggregateMobileToken(aggregateMobileUser('staff')))
        ->getJson('/api/mobile/operations/permits?status=active&academic_period_id='.$period->id.'&search=9Z8Y&per_page=1')
        ->assertOk()
        ->assertJsonStructure(['data', 'links', 'meta'])
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $permit->id)
        ->assertJsonPath('data.0.code_last4', '9Z8Y')
        ->assertJsonMissingPath('data.0.code_hash');

    expect($response->getContent())->not->toContain('sensitive-code-hash');
});

test('staff can fetch permit issue options with selected student state', function () {
    app(PermitSettings::class)->update([
        'default_amount' => 75,
        'currency' => 'GHS',
        'default_validity_days' => 120,
        'permit_requests_enabled' => true,
    ]);

    $period = AcademicPeriod::factory()->active()->create([
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addDays(90),
    ]);
    $student = Student::factory()->create([
        'student_number' => '26101234',
        'name' => 'Issue Options Student',
        'email' => null,
    ]);
    Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'status' => PermitStatus::Active,
        'expires_at' => now()->addDays(30),
    ]);

    $this->withToken(aggregateMobileToken(aggregateMobileUser('staff')))
        ->getJson('/api/mobile/operations/permits/options?student_id='.$student->id)
        ->assertOk()
        ->assertJsonPath('data.default_amount', 75)
        ->assertJsonPath('data.currency', 'GHS')
        ->assertJsonPath('data.default_validity_days', 120)
        ->assertJsonPath('data.permit_requests_enabled', true)
        ->assertJsonPath('data.active_academic_period.id', $period->id)
        ->assertJsonPath('data.student.id', $student->id)
        ->assertJsonPath('data.selected_student_state.has_active_permit', true)
        ->assertJsonPath('data.selected_student_state.missing_email', true)
        ->assertJsonPath('data.student_number_prefix', '2610')
        ->assertJsonPath('data.courses.0', 'Computer Science')
        ->assertJsonPath('data.levels.0', '100');
});

test('students cannot fetch staff permit issue options', function () {
    $studentUser = aggregateMobileUser('student');

    $this->withToken(aggregateMobileToken($studentUser))
        ->getJson('/api/mobile/operations/permits/options')
        ->assertForbidden();
});

test('verification logs list hides identifier hash and filters method result and search', function () {
    $student = Student::factory()->create([
        'student_number' => '26107777',
        'name' => 'Verified Student',
    ]);
    $permit = Permit::factory()->create(['student_id' => $student->id]);
    $verifier = aggregateMobileUser('staff');
    $log = VerificationLog::factory()->create([
        'student_id' => $student->id,
        'permit_id' => $permit->id,
        'verifier_id' => $verifier->id,
        'method' => VerificationMethod::Nfc,
        'result' => VerificationResult::Valid,
        'identifier_hash' => 'sensitive-identifier-hash',
    ]);
    VerificationLog::factory()->create([
        'method' => VerificationMethod::PermitCode,
        'result' => VerificationResult::Invalid,
    ]);

    $response = $this->withToken(aggregateMobileToken($verifier))
        ->getJson('/api/mobile/operations/verification-logs?method=nfc&result=valid&search=Verified&per_page=1')
        ->assertOk()
        ->assertJsonStructure(['data', 'links', 'meta'])
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $log->id)
        ->assertJsonPath('data.0.method', 'nfc')
        ->assertJsonPath('data.0.result', 'valid')
        ->assertJsonMissingPath('data.0.identifier_hash');

    expect($response->getContent())->not->toContain('sensitive-identifier-hash');
});

test('students cannot access operations aggregate lists even with overlapping permissions', function () {
    $studentUser = aggregateMobileUser('student');

    $this->withToken(aggregateMobileToken($studentUser))
        ->getJson('/api/mobile/operations/permits')
        ->assertForbidden();
});
