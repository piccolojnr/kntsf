<?php

use App\Enums\PermitStatus;
use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use App\Models\AcademicPeriod;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Models\VerificationLog;
use App\Support\PermitCodeHasher;
use App\Support\VerificationIdentifierHasher;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function verificationUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function verificationPermitForCode(string $code, array $attributes = []): Permit
{
    $student = $attributes['student'] ?? Student::factory()->create([
        'student_number' => '26102859',
    ]);
    $period = $attributes['academic_period'] ?? AcademicPeriod::factory()->active()->create();

    unset($attributes['student'], $attributes['academic_period']);

    return Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'code_hash' => app(PermitCodeHasher::class)->hash($code),
        'code_last4' => mb_substr($code, -4),
        ...$attributes,
    ]);
}

test('authorized user can verify by student number', function () {
    $permit = verificationPermitForCode('KNT-VERIFY-0001');

    $this->actingAs(verificationUserWithRole('staff'))
        ->post(route('verification.student-number'), [
            'student_number' => $permit->student->student_number,
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::Valid->value);

    $log = VerificationLog::query()->firstOrFail();

    expect($log->method)->toBe(VerificationMethod::StudentNumber)
        ->and($log->result)->toBe(VerificationResult::Valid)
        ->and($log->student_id)->toBe($permit->student_id)
        ->and($log->permit_id)->toBe($permit->id);
});

test('unauthorized user cannot verify', function () {
    $permit = verificationPermitForCode('KNT-VERIFY-0002');

    $this->actingAs(verificationUserWithRole('student'))
        ->post(route('verification.student-number'), [
            'student_number' => $permit->student->student_number,
        ])
        ->assertForbidden();
});

test('valid active permit returns valid', function () {
    $permit = verificationPermitForCode('KNT-VERIFY-0003');

    $this->actingAs(verificationUserWithRole('admin'))
        ->post(route('verification.permit-code'), [
            'permit_code' => 'KNT-VERIFY-0003',
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::Valid->value);

    expect(VerificationLog::query()->firstOrFail()->permit_id)->toBe($permit->id);
});

test('missing student returns not found', function () {
    $this->actingAs(verificationUserWithRole('staff'))
        ->post(route('verification.student-number'), [
            'student_number' => '26109999',
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::NotFound->value);

    expect(VerificationLog::query()->firstOrFail()->student_id)->toBeNull();
});

test('revoked permit returns revoked', function () {
    $permit = verificationPermitForCode('KNT-VERIFY-0004', [
        'status' => PermitStatus::Revoked,
        'revoked_at' => now(),
    ]);

    $this->actingAs(verificationUserWithRole('staff'))
        ->post(route('verification.permit-code'), [
            'permit_code' => 'KNT-VERIFY-0004',
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::Revoked->value);

    expect(VerificationLog::query()->firstOrFail()->permit_id)->toBe($permit->id);
});

test('expired permit returns expired', function () {
    $permit = verificationPermitForCode('KNT-VERIFY-0005', [
        'starts_at' => now()->subDays(10),
        'expires_at' => now()->subDay(),
    ]);

    $this->actingAs(verificationUserWithRole('staff'))
        ->post(route('verification.student-number'), [
            'student_number' => $permit->student->student_number,
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.result', VerificationResult::Expired->value);

    expect($permit->refresh()->status)->toBe(PermitStatus::Expired);
});

test('permit code verification works using hash', function () {
    $plainCode = 'KNT-VERIFY-0006';
    $permit = verificationPermitForCode($plainCode);

    $this->actingAs(verificationUserWithRole('admin'))
        ->post(route('verification.permit-code'), [
            'permit_code' => $plainCode,
        ])
        ->assertRedirect()
        ->assertSessionHas('verificationResult.permit.id', $permit->id);

    $log = VerificationLog::query()->firstOrFail();

    expect($log->identifier_hash)->toBe(app(VerificationIdentifierHasher::class)->hash($plainCode))
        ->and($log->identifier_hash)->not->toBe($plainCode);
});

test('raw permit code is not stored in logs', function () {
    $plainCode = 'KNT-SECRET-0007';
    verificationPermitForCode($plainCode);

    $this->actingAs(verificationUserWithRole('admin'))
        ->post(route('verification.permit-code'), [
            'permit_code' => $plainCode,
        ])
        ->assertRedirect();

    $log = VerificationLog::query()->firstOrFail();

    expect($log->identifier_hash)->not->toBe($plainCode)
        ->and(json_encode($log->metadata))->not->toContain($plainCode)
        ->and($log->reason)->not->toContain($plainCode);
});

test('raw student number is not stored in logs', function () {
    $permit = verificationPermitForCode('KNT-VERIFY-0008');
    $studentNumber = $permit->student->student_number;

    $this->actingAs(verificationUserWithRole('staff'))
        ->post(route('verification.student-number'), [
            'student_number' => $studentNumber,
        ])
        ->assertRedirect();

    $log = VerificationLog::query()->firstOrFail();

    expect($log->identifier_hash)->not->toBe($studentNumber)
        ->and(json_encode($log->metadata))->not->toContain($studentNumber)
        ->and($log->reason)->not->toContain($studentNumber);
});

test('logs page requires permission', function () {
    VerificationLog::factory()->create();

    $this->actingAs(verificationUserWithRole('student'))
        ->get(route('verification.logs'))
        ->assertForbidden();

    $this->actingAs(verificationUserWithRole('admin'))
        ->get(route('verification.logs'))
        ->assertOk();
});
