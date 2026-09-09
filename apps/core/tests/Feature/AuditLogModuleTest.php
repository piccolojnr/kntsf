<?php

use App\Enums\NfcCardStatus;
use App\Enums\PaymentStatus;
use App\Models\AcademicPeriod;
use App\Models\AuditLog;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use App\Notifications\Auth\SetupPasswordNotification;
use App\Support\AuditEvents;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function auditUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('audit logs are created on permit issue', function () {
    $student = Student::factory()->create();
    AcademicPeriod::factory()->active()->create();
    $user = auditUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('permits.store'), [
            'student_id' => $student->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'actor_id' => $user->id,
        'event' => AuditEvents::PermitIssued,
        'subject_type' => $student->getMorphClass(),
        'subject_id' => $student->id,
    ]);
});

test('audit logs are created on payment success', function () {
    $payment = Payment::factory()->create([
        'status' => PaymentStatus::Pending,
    ]);
    $user = auditUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('payments.mark-successful', $payment))
        ->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'actor_id' => $user->id,
        'event' => AuditEvents::PaymentSuccessful,
        'auditable_type' => $payment->getMorphClass(),
        'auditable_id' => $payment->id,
    ]);
});

test('audit logs are created on NFC replacement', function () {
    $card = NfcCard::factory()->create([
        'status' => NfcCardStatus::Active,
    ]);
    $user = auditUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('nfc-cards.replace', $card), [
            'uid' => '04:A1:B2:C3:AA',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'actor_id' => $user->id,
        'event' => AuditEvents::NfcReplaced,
        'subject_type' => $card->student->getMorphClass(),
        'subject_id' => $card->student_id,
    ]);
});

test('audit logs are created on student activation', function () {
    Notification::fake();

    $student = Student::factory()->create([
        'email' => 'audit-student@example.com',
    ]);
    $user = auditUserWithRole('admin');

    $this->actingAs($user)
        ->post(route('students.activate-account', $student))
        ->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'actor_id' => $user->id,
        'event' => AuditEvents::StudentAccountActivated,
        'auditable_type' => $student->getMorphClass(),
        'auditable_id' => $student->id,
    ]);

    Notification::assertSentTo($student->fresh()->user, SetupPasswordNotification::class);
});

test('unauthorized user cannot access audit logs page', function () {
    $this->actingAs(auditUserWithRole('student'))
        ->get(route('audit-logs.index'))
        ->assertForbidden();
});

test('authorized user can filter and view audit logs', function () {
    $user = auditUserWithRole('admin');
    AuditLog::factory()->create([
        'actor_id' => $user->id,
        'event' => AuditEvents::PermitIssued,
        'description' => 'Permit audit entry.',
    ]);
    AuditLog::factory()->create([
        'actor_id' => $user->id,
        'event' => AuditEvents::PaymentFailed,
        'description' => 'Payment audit entry.',
    ]);

    $this->actingAs($user)
        ->get(route('audit-logs.index', ['event' => AuditEvents::PermitIssued]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit-logs/index')
            ->where('logs.data', fn ($logs) => collect($logs)
                ->pluck('event')
                ->all() === [AuditEvents::PermitIssued]));
});

test('old and new values are stored when a student is updated', function () {
    $student = Student::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@example.com',
    ]);
    $user = auditUserWithRole('admin');

    $this->actingAs($user)
        ->patch(route('students.update', $student), [
            'student_number' => $student->student_number,
            'name' => 'New Name',
            'email' => 'new@example.com',
            'phone' => $student->phone,
            'course' => $student->course,
            'level' => $student->level,
        ])
        ->assertRedirect();

    $log = AuditLog::query()
        ->where('event', AuditEvents::StudentUpdated)
        ->sole();

    expect($log->old_values['name'])->toBe('Old Name')
        ->and($log->new_values['name'])->toBe('New Name')
        ->and($log->old_values['email'])->toBe('old@example.com')
        ->and($log->new_values['email'])->toBe('new@example.com');
});
