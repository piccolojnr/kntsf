<?php

use App\Enums\NfcCardStatus;
use App\Enums\PaymentStatus;
use App\Enums\PermitStatus;
use App\Enums\VerificationResult;
use App\Models\AcademicPeriod;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Models\VerificationLog;
use App\Support\DashboardSummary;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function reportingUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('authorized user can view dashboard summary', function () {
    Student::factory()->count(2)->create();

    $this->actingAs(reportingUserWithRole('admin'))
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('summary.total_students', 2)
            ->has('warnings')
            ->has('recentActivity'));
});

test('dashboard summary returns expected counts', function () {
    $activeUser = User::factory()->create([
        'password' => Hash::make('Password123!'),
    ]);
    $pendingUser = User::factory()->create([
        'password' => null,
    ]);
    $activeStudent = Student::factory()->create(['user_id' => $activeUser->id]);
    Student::factory()->create(['user_id' => $pendingUser->id]);
    $unlinkedStudent = Student::factory()->create();

    $period = AcademicPeriod::factory()->active()->create();

    Permit::factory()->create([
        'student_id' => $activeStudent->id,
        'academic_period_id' => $period->id,
        'status' => PermitStatus::Active,
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDays(10),
    ]);
    Permit::factory()->create([
        'student_id' => $unlinkedStudent->id,
        'academic_period_id' => $period->id,
        'status' => PermitStatus::Active,
        'starts_at' => now()->subDays(10),
        'expires_at' => now()->subDay(),
    ]);
    Permit::factory()->revoked()->create([
        'student_id' => $unlinkedStudent->id,
        'academic_period_id' => $period->id,
    ]);

    NfcCard::factory()->create([
        'student_id' => $activeStudent->id,
        'status' => NfcCardStatus::Active,
    ]);
    Payment::factory()->create([
        'student_id' => $activeStudent->id,
        'status' => PaymentStatus::Pending,
    ]);
    Payment::factory()->successful()->create([
        'student_id' => $activeStudent->id,
    ]);
    VerificationLog::factory()->create([
        'result' => VerificationResult::Valid,
        'created_at' => now(),
    ]);
    VerificationLog::factory()->create([
        'result' => VerificationResult::NotFound,
        'created_at' => now(),
    ]);

    $counts = app(DashboardSummary::class)->counts();

    expect($counts['total_students'])->toBe(3)
        ->and($counts['activated_student_accounts'])->toBe(1)
        ->and($counts['pending_setup_student_accounts'])->toBe(1)
        ->and($counts['active_permits'])->toBe(1)
        ->and($counts['expired_permits'])->toBe(1)
        ->and($counts['revoked_permits'])->toBe(1)
        ->and($counts['active_nfc_cards'])->toBe(1)
        ->and($counts['pending_payments'])->toBe(1)
        ->and($counts['successful_payments'])->toBe(1)
        ->and($counts['verification_attempts_today'])->toBe(2)
        ->and($counts['failed_verification_attempts_today'])->toBe(1);
});

test('reports page requires permission', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('reports.index'))
        ->assertForbidden();
});

test('reports page loads for permitted user', function () {
    Student::factory()->create();
    Payment::factory()->successful()->create();

    $this->actingAs(reportingUserWithRole('admin'))
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('reports.students.total', 2)
            ->where('reports.payments.successful', 1)
            ->has('reports.permits')
            ->has('reports.nfc_cards')
            ->has('reports.verification'));
});

test('reports can be filtered by year', function () {
    Student::factory()->create([
        'created_at' => now()->setYear(2025)->startOfYear(),
        'updated_at' => now()->setYear(2025)->startOfYear(),
    ]);
    Student::factory()->create([
        'created_at' => now()->setYear(2026)->startOfYear(),
        'updated_at' => now()->setYear(2026)->startOfYear(),
    ]);

    $this->actingAs(reportingUserWithRole('admin'))
        ->get(route('reports.index', [
            'period' => 'year',
            'year' => 2025,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('filters.preset', 'year')
            ->where('filters.year', 2025)
            ->where('reports.students.total', 1));
});

test('report exports use the selected period', function (string $format, string $contentType) {
    Student::factory()->create([
        'created_at' => now()->setYear(2025)->startOfYear(),
        'updated_at' => now()->setYear(2025)->startOfYear(),
    ]);
    Student::factory()->create([
        'created_at' => now()->setYear(2026)->startOfYear(),
        'updated_at' => now()->setYear(2026)->startOfYear(),
    ]);

    $this->actingAs(reportingUserWithRole('admin'))
        ->get(route('reports.export', [
            'format' => $format,
            'period' => 'year',
            'year' => 2025,
        ]))
        ->assertOk()
        ->assertHeader('content-type', $contentType);
})->with([
    'pdf' => ['pdf', 'application/pdf'],
    'excel' => ['excel', 'application/vnd.ms-excel; charset=UTF-8'],
    'csv' => ['csv', 'text/csv; charset=UTF-8'],
]);
