<?php

use App\Enums\PaymentStatus;
use App\Enums\PermitRequestReviewStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\StudentVerificationStatus;
use App\Models\AcademicPeriod;
use App\Models\AuditLog;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\User;
use App\Support\DashboardSummary;
use App\Support\PermitSettings;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
    app(PermitSettings::class)->update(['permit_requests_enabled' => true]);
});

function fakePermitRequestPaystackVerify(string $reference, string $status = 'success'): void
{
    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response([
            'status' => true,
            'message' => 'Verification complete',
            'data' => [
                'reference' => $reference,
                'status' => $status,
                'amount' => 5000,
                'channel' => 'card',
                'paid_at' => now()->toISOString(),
            ],
        ]),
    ]);
}

function permitRequestUser(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('review required requests are visible to admins', function () {
    $permitRequest = PermitRequest::factory()->create([
        'requires_review' => true,
        'review_status' => PermitRequestReviewStatus::PendingReview,
    ]);

    $this->actingAs(permitRequestUser('admin'))
        ->get(route('permit-requests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('permit-requests/index')
            ->where('permitRequests.data.0.id', $permitRequest->id));
});

test('staff can view but cannot approve permit request review', function () {
    $permitRequest = PermitRequest::factory()->create([
        'requires_review' => true,
        'review_status' => PermitRequestReviewStatus::PendingReview,
    ]);

    $this->actingAs(permitRequestUser('staff'))
        ->get(route('permit-requests.index'))
        ->assertOk();

    $this->actingAs(permitRequestUser('staff'))
        ->post(route('permit-requests.approve-review', $permitRequest))
        ->assertForbidden();
});

test('admin can approve a paid reviewed request and issue permit', function () {
    $period = AcademicPeriod::factory()->active()->create();
    $student = Student::factory()->create([
        'verification_status' => StudentVerificationStatus::PendingReview,
    ]);
    $payment = Payment::factory()->successful()->create([
        'student_id' => $student->id,
    ]);
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'payment_id' => $payment->id,
        'status' => PermitRequestStatus::Paid,
        'requires_review' => true,
        'review_status' => PermitRequestReviewStatus::PendingReview,
    ]);

    $admin = permitRequestUser('admin');

    $this->actingAs($admin)
        ->post(route('permit-requests.approve-review', $permitRequest), [
            'review_notes' => 'Student verified.',
        ])
        ->assertRedirect();

    expect($student->refresh()->verification_status)->toBe(StudentVerificationStatus::Verified)
        ->and($student->verified_by_id)->toBe($admin->id)
        ->and($permitRequest->refresh()->review_status)->toBe(PermitRequestReviewStatus::Approved)
        ->and($permitRequest->status)->toBe(PermitRequestStatus::Issued)
        ->and(Permit::query()->where('student_id', $student->id)->where('academic_period_id', $period->id)->count())->toBe(1)
        ->and($payment->refresh()->permit_id)->not->toBeNull();
});

test('admin can reject a permit request review', function () {
    $student = Student::factory()->create([
        'verification_status' => StudentVerificationStatus::PendingReview,
    ]);
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $student->id,
        'requires_review' => true,
        'review_status' => PermitRequestReviewStatus::PendingReview,
    ]);

    $this->actingAs(permitRequestUser('admin'))
        ->post(route('permit-requests.reject-review', $permitRequest), [
            'review_notes' => 'Could not verify record.',
        ])
        ->assertRedirect();

    expect($student->refresh()->verification_status)->toBe(StudentVerificationStatus::Rejected)
        ->and($permitRequest->refresh()->review_status)->toBe(PermitRequestReviewStatus::Rejected);
});

test('admin can retry verification for stuck permit request', function () {
    $period = AcademicPeriod::factory()->active()->create();
    $student = Student::factory()->create();
    $payment = Payment::factory()->create([
        'student_id' => $student->id,
        'status' => PaymentStatus::Pending,
    ]);
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'payment_id' => $payment->id,
        'status' => PermitRequestStatus::AwaitingPayment,
    ]);

    fakePermitRequestPaystackVerify($payment->reference);

    $this->actingAs(permitRequestUser('admin'))
        ->post(route('permit-requests.retry-verification', $permitRequest))
        ->assertRedirect();

    expect($payment->refresh()->status)->toBe(PaymentStatus::Success)
        ->and($permitRequest->refresh()->status)->toBe(PermitRequestStatus::Issued)
        ->and(Permit::query()->where('student_id', $student->id)->count())->toBe(1)
        ->and(AuditLog::query()->where('event', 'permit_request.verification_retried')->exists())->toBeTrue();
});

test('admin can retry issuance after successful payment', function () {
    $period = AcademicPeriod::factory()->active()->create();
    $student = Student::factory()->create();
    $payment = Payment::factory()->successful()->create([
        'student_id' => $student->id,
        'permit_id' => null,
    ]);
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'payment_id' => $payment->id,
        'status' => PermitRequestStatus::Paid,
    ]);

    $this->actingAs(permitRequestUser('admin'))
        ->post(route('permit-requests.retry-issuance', $permitRequest))
        ->assertRedirect();

    expect($permitRequest->refresh()->status)->toBe(PermitRequestStatus::Issued)
        ->and($payment->refresh()->permit_id)->not->toBeNull()
        ->and(Permit::query()->where('student_id', $student->id)->count())->toBe(1);
});

test('retry issuance is idempotent', function () {
    $period = AcademicPeriod::factory()->active()->create();
    $student = Student::factory()->create();
    $permit = Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
    ]);
    $payment = Payment::factory()->successful()->create([
        'student_id' => $student->id,
        'permit_id' => $permit->id,
    ]);
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
        'payment_id' => $payment->id,
        'status' => PermitRequestStatus::Issued,
    ]);

    $admin = permitRequestUser('admin');

    $this->actingAs($admin)
        ->post(route('permit-requests.retry-issuance', $permitRequest))
        ->assertRedirect();

    $this->actingAs($admin)
        ->post(route('permit-requests.retry-issuance', $permitRequest))
        ->assertRedirect();

    expect(Permit::query()->where('student_id', $student->id)->where('academic_period_id', $period->id)->count())->toBe(1);
});

test('unpaid expired requests are marked expired by command', function () {
    $expired = PermitRequest::factory()->create([
        'status' => PermitRequestStatus::AwaitingPayment,
        'expires_at' => now()->subMinute(),
    ]);
    $paid = PermitRequest::factory()->create([
        'status' => PermitRequestStatus::Paid,
        'expires_at' => now()->subMinute(),
    ]);

    $this->artisan('permit-requests:expire')
        ->assertSuccessful();

    expect($expired->refresh()->status)->toBe(PermitRequestStatus::Expired)
        ->and($paid->refresh()->status)->toBe(PermitRequestStatus::Paid)
        ->and(AuditLog::query()->where('event', 'permit_request.expired')->exists())->toBeTrue();
});

test('recovery actions require permission', function () {
    $permitRequest = PermitRequest::factory()->create([
        'status' => PermitRequestStatus::AwaitingPayment,
    ]);

    $this->actingAs(permitRequestUser('staff'))
        ->post(route('permit-requests.mark-expired', $permitRequest))
        ->assertForbidden();
});

test('dashboard report summary includes stuck permit request counts', function () {
    $student = Student::factory()->create();
    $payment = Payment::factory()->successful()->create([
        'student_id' => $student->id,
        'permit_id' => null,
    ]);

    PermitRequest::factory()->create([
        'student_id' => $student->id,
        'payment_id' => $payment->id,
        'status' => PermitRequestStatus::Paid,
    ]);

    $summary = app(DashboardSummary::class);

    expect($summary->counts()['stuck_permit_requests'])->toBeGreaterThan(0)
        ->and($summary->reports()['permit_requests']['paid_not_issued'])->toBe(1);
});
