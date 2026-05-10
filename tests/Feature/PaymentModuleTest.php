<?php

use App\Enums\PaymentStatus;
use App\Models\AcademicPeriod;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Student;
use App\Models\User;
use App\Support\PaymentReferenceGenerator;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function paymentUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('authorized user can create pending manual payment', function () {
    $student = Student::factory()->create();
    $user = paymentUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '25.50',
            'currency' => 'ghs',
            'status' => 'pending',
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    expect($payment->student_id)->toBe($student->id)
        ->and($payment->status)->toBe(PaymentStatus::Pending)
        ->and($payment->gateway)->toBe('manual')
        ->and($payment->currency)->toBe('GHS')
        ->and($payment->created_by_id)->toBe($user->id);
});

test('authorized user can create successful manual payment', function () {
    $student = Student::factory()->create();

    $this->actingAs(paymentUserWithRole('admin'))
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '40.00',
            'status' => 'success',
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    expect($payment->status)->toBe(PaymentStatus::Success)
        ->and($payment->paid_at)->not->toBeNull()
        ->and($payment->verified_at)->not->toBeNull();
});

test('unauthorized user cannot manage payments', function () {
    $student = Student::factory()->create();

    $this->actingAs(paymentUserWithRole('student'))
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '10.00',
        ])
        ->assertForbidden();
});

test('payment reference is unique', function () {
    $first = app(PaymentReferenceGenerator::class)->generate();

    Payment::factory()->create([
        'reference' => $first,
    ]);

    $second = app(PaymentReferenceGenerator::class)->generate();

    expect($second)->not->toBe($first)
        ->and($second)->toStartWith('PAY-'.now()->format('Y').'-');
});

test('successful manual payment can issue permit', function () {
    $student = Student::factory()->create();
    $period = AcademicPeriod::factory()->active()->create();

    $this->actingAs(paymentUserWithRole('admin'))
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '50.00',
            'status' => 'success',
            'issue_permit' => '1',
            'academic_period_id' => $period->id,
        ])
        ->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    expect($payment->permit_id)->not->toBeNull()
        ->and(Permit::query()->where('student_id', $student->id)->where('academic_period_id', $period->id)->count())->toBe(1);
});

test('successful manual payment does not duplicate permit for same student and period', function () {
    $student = Student::factory()->create();
    $period = AcademicPeriod::factory()->active()->create();

    $this->actingAs(paymentUserWithRole('admin'))
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '50.00',
            'status' => 'success',
            'issue_permit' => '1',
            'academic_period_id' => $period->id,
        ])
        ->assertRedirect();

    $this->actingAs(paymentUserWithRole('admin'))
        ->from(route('payments.index'))
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '50.00',
            'status' => 'success',
            'issue_permit' => '1',
            'academic_period_id' => $period->id,
        ])
        ->assertRedirect(route('payments.index'))
        ->assertSessionHasErrors('payment');

    expect(Permit::query()->where('student_id', $student->id)->where('academic_period_id', $period->id)->count())->toBe(1)
        ->and(Payment::query()->count())->toBe(1);
});

test('failed payment requires reason', function () {
    $payment = Payment::factory()->create();

    $this->actingAs(paymentUserWithRole('admin'))
        ->post(route('payments.mark-failed', $payment), [
            'notes' => 'Missing receipt',
        ])
        ->assertSessionHasErrors('failure_reason');
});

test('cancelled payment cannot be marked successful', function () {
    $payment = Payment::factory()->create([
        'status' => PaymentStatus::Cancelled,
    ]);

    $this->actingAs(paymentUserWithRole('admin'))
        ->from(route('payments.show', $payment))
        ->post(route('payments.mark-successful', $payment))
        ->assertRedirect(route('payments.show', $payment))
        ->assertSessionHasErrors('payment');

    expect($payment->refresh()->status)->toBe(PaymentStatus::Cancelled);
});

test('payment amount uses decimal correctly', function () {
    $student = Student::factory()->create();

    $this->actingAs(paymentUserWithRole('admin'))
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '12.30',
        ])
        ->assertRedirect();

    expect(Payment::query()->firstOrFail()->amount)->toBe('12.30');
});

test('soft deleted payments are excluded from normal index', function () {
    $deletedPayment = Payment::factory()->create();
    $visiblePayment = Payment::factory()->create();

    $deletedPayment->delete();

    $this->actingAs(paymentUserWithRole('admin'))
        ->get(route('payments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('payments/index')
            ->where('payments.data', fn ($payments) => collect($payments)
                ->pluck('id')
                ->all() === [$visiblePayment->id]));
});
