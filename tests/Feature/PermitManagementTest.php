<?php

use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Support\PermitSettings;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function permitUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('authorized user can issue permit', function () {
    $student = Student::factory()->create();
    $period = AcademicPeriod::factory()->active()->create();
    $user = permitUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('permits.store'), [
            'student_id' => $student->id,
        ])
        ->assertRedirect();

    $permit = Permit::query()->firstOrFail();

    expect($permit->student_id)->toBe($student->id)
        ->and($permit->academic_period_id)->toBe($period->id)
        ->and($permit->issued_by_id)->toBe($user->id)
        ->and($permit->status)->toBe(PermitStatus::Active);
});

test('issue form receives settings defaults and student emails', function () {
    app(PermitSettings::class)->update([
        'default_amount' => 25,
        'currency' => 'GHS',
        'default_validity_days' => 60,
        'permit_requests_enabled' => false,
    ]);

    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'student@example.com',
    ]);
    AcademicPeriod::factory()->active()->create();

    $this->actingAs(permitUserWithRole('admin'))
        ->get(route('permits.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('options.students.0.id', $student->id)
            ->where('options.students.0.email', 'student@example.com')
            ->where('options.issue_defaults.amount_paid', 25)
            ->where('options.issue_defaults.currency', 'GHS'));
});

test('issuing permit can update selected student email', function () {
    $student = Student::factory()->create([
        'email' => 'old@example.com',
    ]);
    AcademicPeriod::factory()->active()->create();

    $this->actingAs(permitUserWithRole('admin'))
        ->post(route('permits.store'), [
            'student_id' => $student->id,
            'student_email' => 'new@example.com',
        ])
        ->assertRedirect();

    expect($student->refresh()->email)->toBe('new@example.com');
});

test('unauthorized user cannot issue permit', function () {
    $student = Student::factory()->create();
    AcademicPeriod::factory()->active()->create();

    $this->actingAs(permitUserWithRole('student'))
        ->post(route('permits.store'), [
            'student_id' => $student->id,
        ])
        ->assertForbidden();
});

test('issue requires active academic period if one is not passed', function () {
    $student = Student::factory()->create();

    $this->actingAs(permitUserWithRole('admin'))
        ->from(route('permits.index'))
        ->post(route('permits.store'), [
            'student_id' => $student->id,
        ])
        ->assertRedirect(route('permits.index'))
        ->assertSessionHasErrors('permit');

    expect(Permit::query()->count())->toBe(0);
});

test('duplicate active permit for same student and period is blocked', function () {
    $student = Student::factory()->create();
    $period = AcademicPeriod::factory()->active()->create();

    $this->actingAs(permitUserWithRole('admin'))
        ->post(route('permits.store'), [
            'student_id' => $student->id,
            'academic_period_id' => $period->id,
        ])
        ->assertRedirect();

    $this->actingAs(permitUserWithRole('admin'))
        ->from(route('permits.index'))
        ->post(route('permits.store'), [
            'student_id' => $student->id,
            'academic_period_id' => $period->id,
        ])
        ->assertRedirect(route('permits.index'))
        ->assertSessionHasErrors('permit');

    expect(Permit::query()->count())->toBe(1);
});

test('code hash is stored and plain code is not stored', function () {
    $student = Student::factory()->create();
    AcademicPeriod::factory()->active()->create();

    $response = $this->actingAs(permitUserWithRole('admin'))
        ->post(route('permits.store'), [
            'student_id' => $student->id,
        ]);

    $response->assertSessionHas('issuedPermitCode');

    $plainCode = session('issuedPermitCode');
    $permit = Permit::query()->firstOrFail();

    expect(Schema::hasColumn('permits', 'code'))->toBeFalse()
        ->and(Schema::hasColumn('permits', 'plain_code'))->toBeFalse()
        ->and($permit->code_hash)->not->toBe($plainCode)
        ->and($permit->code_last4)->toBe(mb_substr($plainCode, -4));
});

test('permit can be revoked', function () {
    $permit = Permit::factory()->create();
    $user = permitUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('permits.revoke', $permit), [
            'revocation_reason' => 'Lost card',
        ])
        ->assertRedirect();

    $permit->refresh();

    expect($permit->status)->toBe(PermitStatus::Revoked)
        ->and($permit->revoked_by_id)->toBe($user->id)
        ->and($permit->revocation_reason)->toBe('Lost card');
});

test('revoked permit cannot be revoked twice', function () {
    $permit = Permit::factory()->revoked()->create();

    $this->actingAs(permitUserWithRole('admin'))
        ->from(route('permits.show', $permit))
        ->post(route('permits.revoke', $permit))
        ->assertRedirect(route('permits.show', $permit))
        ->assertSessionHasErrors('permit');
});

test('card delivered can be marked', function () {
    $permit = Permit::factory()->create();

    $this->actingAs(permitUserWithRole('admin'))
        ->post(route('permits.mark-card-delivered', $permit))
        ->assertRedirect();

    expect($permit->refresh()->card_delivered_at)->not->toBeNull();
});

test('permit index excludes soft deleted permits', function () {
    $deletedPermit = Permit::factory()->create();
    $visiblePermit = Permit::factory()->create();

    $deletedPermit->delete();

    $this->actingAs(permitUserWithRole('admin'))
        ->get(route('permits.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('permits/index')
            ->where('permits.data', fn ($permits) => collect($permits)
                ->pluck('id')
                ->all() === [$visiblePermit->id]));
});

test('permissions are enforced for permit index', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('permits.index'))
        ->assertForbidden();
});
