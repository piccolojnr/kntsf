<?php

use App\Enums\PaymentStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\StudentSource;
use App\Enums\StudentVerificationStatus;
use App\Models\AcademicPeriod;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Support\PermitSettings;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);

    config([
        'services.paystack.secret_key' => 'test-secret',
        'services.paystack.webhook_secret' => 'test-secret',
        'services.paystack.payment_url' => 'https://api.paystack.co',
    ]);

    app(PermitSettings::class)->update([
        'default_amount' => 50,
        'currency' => 'GHS',
        'default_validity_days' => 120,
        'permit_requests_enabled' => true,
    ]);

    AcademicPeriod::factory()->active()->create();
    Notification::fake();
});

function fakePaystackInitialize(): void
{
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'message' => 'Authorization URL created',
            'data' => [
                'authorization_url' => 'https://checkout.paystack.test/pay',
                'access_code' => 'access-code',
                'reference' => 'gateway-reference',
            ],
        ]),
    ]);
}

function fakePaystackVerify(string $reference, string $status = 'success'): void
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

function paystackWebhook(string $event, string $reference): array
{
    return [
        'event' => $event,
        'data' => [
            'reference' => $reference,
        ],
    ];
}

test('existing student can create a self service permit request', function () {
    fakePaystackInitialize();

    $student = Student::factory()->create([
        'student_number' => '26102859',
        'name' => 'Daniel Addo',
        'email' => 'student@example.com',
    ]);

    $this->post(route('public.permit-request.store'), [
        'student_exists' => true,
        'student_number' => $student->student_number,
        'email' => $student->email,
        'phone' => '0240000000',
    ])->assertRedirect();

    $permitRequest = PermitRequest::query()->firstOrFail();
    $payment = Payment::query()->firstOrFail();

    expect($permitRequest->student_id)->toBe($student->id)
        ->and($permitRequest->status)->toBe(PermitRequestStatus::AwaitingPayment)
        ->and($permitRequest->requires_review)->toBeFalse()
        ->and($payment->status)->toBe(PaymentStatus::Pending)
        ->and(Permit::query()->count())->toBe(0);
});

test('existing student with contact details can request without re-entering contact fields', function () {
    fakePaystackInitialize();

    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'student@example.com',
        'phone' => '0240000000',
    ]);

    $this->post(route('public.permit-request.store'), [
        'student_exists' => true,
        'student_number' => $student->student_number,
    ])->assertRedirect();

    $permitRequest = PermitRequest::query()->firstOrFail();

    expect($permitRequest->contact_email)->toBe('student@example.com')
        ->and($permitRequest->contact_phone)->toBe('0240000000')
        ->and(Payment::query()->count())->toBe(1);
});

test('self service student creation is marked pending review', function () {
    fakePaystackInitialize();

    $this->post(route('public.permit-request.store'), [
        'student_exists' => false,
        'student_number' => '26109999',
        'name' => 'New Student',
        'email' => 'new@example.com',
        'phone' => '0240000000',
        'course' => 'Computer Science',
        'level' => '100',
    ])->assertRedirect();

    $student = Student::query()->where('student_number', '26109999')->firstOrFail();
    $permitRequest = PermitRequest::query()->firstOrFail();

    expect($student->source)->toBe(StudentSource::SelfService)
        ->and($student->verification_status)->toBe(StudentVerificationStatus::PendingReview)
        ->and($permitRequest->requires_review)->toBeTrue()
        ->and($permitRequest->review_status->value)->toBe('pending_review');
});

test('public permit request page receives strict student options', function () {
    $this->get(route('public.permit-request.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/permit-request/index')
            ->where('studentOptions.student_number_prefix', '2610')
            ->where('studentOptions.levels.0.value', '100')
            ->where('studentOptions.courses.0.value', 'Computer Science'));
});

test('self service student creation rejects invalid course and level values', function () {
    fakePaystackInitialize();

    $this->from(route('public.permit-request.index'))
        ->post(route('public.permit-request.store'), [
            'student_exists' => false,
            'student_number' => '26109999',
            'name' => 'New Student',
            'email' => 'new@example.com',
            'phone' => '0240000000',
            'course' => 'Invalid Course',
            'level' => '900',
        ])
        ->assertRedirect(route('public.permit-request.index'))
        ->assertSessionHasErrors(['course', 'level']);
});

test('masked student preview is returned publicly without full profile data', function () {
    $student = Student::factory()->create([
        'student_number' => '26102859',
        'name' => 'Daniel Addo',
        'course' => 'Computer Science',
        'level' => '400',
    ]);

    $this->getJson(route('public.permit-request.preview', [
        'student_number' => $student->student_number,
    ]))
        ->assertOk()
        ->assertJsonPath('exists', true)
        ->assertJsonMissing(['email' => $student->email])
        ->assertJsonPath('student.name', 'D***** A***')
        ->assertJsonPath('student.student_number', '2610****')
        ->assertJsonPath('student.has_email', filled($student->email))
        ->assertJsonPath('student.has_phone', filled($student->phone))
        ->assertJsonPath('student.can_request', true);
});

test('student with active permit is blocked before payment initialization', function () {
    fakePaystackInitialize();

    $period = AcademicPeriod::query()->where('is_active', true)->firstOrFail();
    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'student@example.com',
        'phone' => '0240000000',
    ]);
    Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
    ]);

    $this->from(route('public.permit-request.index'))
        ->post(route('public.permit-request.store'), [
            'student_exists' => true,
            'student_number' => $student->student_number,
        ])
        ->assertRedirect(route('public.permit-request.index'))
        ->assertSessionHasErrors('permit_request');

    expect(Payment::query()->count())->toBe(0)
        ->and(PermitRequest::query()->count())->toBe(0);
});

test('preview flags student with active permit as unable to request', function () {
    $period = AcademicPeriod::query()->where('is_active', true)->firstOrFail();
    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'student@example.com',
        'phone' => '0240000000',
    ]);
    Permit::factory()->create([
        'student_id' => $student->id,
        'academic_period_id' => $period->id,
    ]);

    $this->getJson(route('public.permit-request.preview', [
        'student_number' => $student->student_number,
    ]))
        ->assertOk()
        ->assertJsonPath('student.can_request', false)
        ->assertJsonPath('student.block_reason', 'This student already has an active permit for the current academic period.');
});

test('existing student email cannot be overwritten through self service', function () {
    fakePaystackInitialize();

    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'old@example.com',
    ]);

    $this->from(route('public.permit-request.index'))
        ->post(route('public.permit-request.store'), [
            'student_exists' => true,
            'student_number' => $student->student_number,
            'email' => 'new@example.com',
            'phone' => '0240000000',
        ])
        ->assertRedirect(route('public.permit-request.index'))
        ->assertSessionHasErrors('permit_request');

    expect($student->refresh()->email)->toBe('old@example.com')
        ->and(PermitRequest::query()->count())->toBe(0);
});

test('callback verifies payment server side and issues permit for verified existing student', function () {
    fakePaystackInitialize();

    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'student@example.com',
    ]);

    $this->post(route('public.permit-request.store'), [
        'student_exists' => true,
        'student_number' => $student->student_number,
        'email' => $student->email,
        'phone' => '0240000000',
    ])->assertRedirect();

    $payment = Payment::query()->firstOrFail();
    fakePaystackVerify($payment->reference);

    $this->get(route('public.permit-request.callback', ['reference' => $payment->reference]))
        ->assertRedirect();

    expect($payment->refresh()->status)->toBe(PaymentStatus::Success)
        ->and(Permit::query()->where('student_id', $student->id)->count())->toBe(1)
        ->and(PermitRequest::query()->firstOrFail()->status)->toBe(PermitRequestStatus::Issued);
});

test('paystack webhook is idempotent and does not duplicate permits', function () {
    fakePaystackInitialize();

    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'student@example.com',
    ]);

    $this->post(route('public.permit-request.store'), [
        'student_exists' => true,
        'student_number' => $student->student_number,
        'email' => $student->email,
        'phone' => '0240000000',
    ])->assertRedirect();

    $payment = Payment::query()->firstOrFail();
    fakePaystackVerify($payment->reference);

    $payload = json_encode(paystackWebhook('charge.success', $payment->reference), JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha512', $payload, 'test-secret');

    $this->call('POST', route('payments.paystack.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
    ], $payload)->assertOk();

    $this->call('POST', route('payments.paystack.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
    ], $payload)->assertOk();

    expect(Permit::query()->where('student_id', $student->id)->count())->toBe(1);
});

test('self service student payment does not issue until review is approved', function () {
    fakePaystackInitialize();

    $this->post(route('public.permit-request.store'), [
        'student_exists' => false,
        'student_number' => '26109999',
        'name' => 'New Student',
        'email' => 'new@example.com',
        'phone' => '0240000000',
        'course' => 'Computer Science',
        'level' => '100',
    ])->assertRedirect();

    $payment = Payment::query()->firstOrFail();
    fakePaystackVerify($payment->reference);

    $this->get(route('public.permit-request.callback', ['reference' => $payment->reference]))
        ->assertRedirect();

    expect(Payment::query()->firstOrFail()->status)->toBe(PaymentStatus::Success)
        ->and(Permit::query()->count())->toBe(0)
        ->and(PermitRequest::query()->firstOrFail()->status)->toBe(PermitRequestStatus::Paid);
});

test('failed payment does not issue permit', function () {
    fakePaystackInitialize();

    $student = Student::factory()->create([
        'student_number' => '26102859',
        'email' => 'student@example.com',
    ]);

    $this->post(route('public.permit-request.store'), [
        'student_exists' => true,
        'student_number' => $student->student_number,
        'email' => $student->email,
        'phone' => '0240000000',
    ])->assertRedirect();

    $payment = Payment::query()->firstOrFail();

    $payload = json_encode(paystackWebhook('charge.failed', $payment->reference), JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha512', $payload, 'test-secret');

    $this->call('POST', route('payments.paystack.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
    ], $payload)->assertOk();

    expect(Permit::query()->count())->toBe(0)
        ->and(PermitRequest::query()->firstOrFail()->status)->toBe(PermitRequestStatus::Failed);
});
