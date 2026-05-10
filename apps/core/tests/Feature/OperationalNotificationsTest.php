<?php

use App\Actions\Payments\CancelPaymentAction;
use App\Actions\Payments\MarkPaymentFailedAction;
use App\Enums\PaymentStatus;
use App\Models\AcademicPeriod;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use App\Notifications\NfcCards\NfcCardLostNotification;
use App\Notifications\NfcCards\NfcCardRegisteredNotification;
use App\Notifications\NfcCards\NfcCardRevokedNotification;
use App\Notifications\Payments\PaymentCancelledNotification;
use App\Notifications\Payments\PaymentDueNotification;
use App\Notifications\Payments\PaymentFailedNotification;
use App\Notifications\Payments\PaymentSuccessfulNotification;
use App\Notifications\Permits\PermitIssuedNotification;
use App\Notifications\Permits\PermitRevokedNotification;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function notificationAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function studentWithUser(): Student
{
    return Student::factory()->create([
        'user_id' => User::factory()->create()->id,
    ]);
}

test('operational notifications are synchronous', function () {
    $notifications = [
        PermitIssuedNotification::class,
        PermitRevokedNotification::class,
        PaymentDueNotification::class,
        PaymentSuccessfulNotification::class,
        PaymentFailedNotification::class,
        PaymentCancelledNotification::class,
        NfcCardRegisteredNotification::class,
        NfcCardLostNotification::class,
        NfcCardRevokedNotification::class,
    ];

    foreach ($notifications as $notification) {
        expect(is_subclass_of($notification, ShouldQueue::class))->toBeFalse();
    }
});

test('permit issue and revoke notifications are sent', function () {
    Notification::fake();

    $student = studentWithUser();
    AcademicPeriod::factory()->active()->create();
    $admin = notificationAdmin();

    $this->actingAs($admin)
        ->post(route('permits.store'), ['student_id' => $student->id])
        ->assertRedirect();

    Notification::assertSentTo($student->user, PermitIssuedNotification::class);

    $permit = $student->permits()->firstOrFail();

    $this->actingAs($admin)
        ->post(route('permits.revoke', $permit), ['revocation_reason' => 'Testing'])
        ->assertRedirect();

    Notification::assertSentTo($student->user, PermitRevokedNotification::class);
});

test('payment lifecycle notifications are sent', function () {
    Notification::fake();

    $student = studentWithUser();
    $admin = notificationAdmin();

    $this->actingAs($admin)
        ->post(route('payments.store'), [
            'student_id' => $student->id,
            'amount' => '25.00',
            'status' => PaymentStatus::Pending->value,
        ])
        ->assertRedirect();

    Notification::assertSentTo($student->user, PaymentDueNotification::class);

    $payment = Payment::query()->whereBelongsTo($student)->firstOrFail();

    $this->actingAs($admin)
        ->post(route('payments.mark-successful', $payment))
        ->assertRedirect();

    Notification::assertSentTo($student->user, PaymentSuccessfulNotification::class);

    $failedPayment = Payment::factory()->create([
        'student_id' => $student->id,
        'status' => PaymentStatus::Pending,
    ]);

    app(MarkPaymentFailedAction::class)->handle($failedPayment, [
        'failure_reason' => 'Missing receipt',
    ], $admin);

    Notification::assertSentTo($student->user, PaymentFailedNotification::class);

    $cancelledPayment = Payment::factory()->create([
        'student_id' => $student->id,
        'status' => PaymentStatus::Pending,
    ]);

    app(CancelPaymentAction::class)->handle($cancelledPayment, [], $admin);

    Notification::assertSentTo($student->user, PaymentCancelledNotification::class);
});

test('NFC lifecycle notifications are sent', function () {
    Notification::fake();

    $student = studentWithUser();
    $admin = notificationAdmin();

    $this->actingAs($admin)
        ->post(route('nfc-cards.store'), [
            'student_id' => $student->id,
            'uid' => '04:A1:B2:C3:AA',
        ])
        ->assertRedirect();

    Notification::assertSentTo($student->user, NfcCardRegisteredNotification::class);

    $card = NfcCard::query()->whereBelongsTo($student)->firstOrFail();

    $this->actingAs($admin)
        ->post(route('nfc-cards.revoke', $card))
        ->assertRedirect();

    Notification::assertSentTo($student->user, NfcCardRevokedNotification::class);
});
