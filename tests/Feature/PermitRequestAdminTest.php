<?php

use App\Enums\PermitRequestReviewStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\StudentVerificationStatus;
use App\Models\AcademicPeriod;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\User;
use App\Support\PermitSettings;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
    app(PermitSettings::class)->update(['permit_requests_enabled' => true]);
});

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
