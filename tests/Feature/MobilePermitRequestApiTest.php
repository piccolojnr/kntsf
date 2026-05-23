<?php

use App\Enums\PaymentStatus;
use App\Enums\PermitRequestStatus;
use App\Enums\PermitStatus;
use App\Models\AcademicPeriod;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\User;
use App\Support\PermitSettings;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
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

function mobilePermitStudentUser(array $studentAttributes = [], array $userAttributes = []): User
{
    $user = User::factory()->create([
        'password' => Hash::make('Password123!'),
        ...$userAttributes,
    ]);
    $user->assignRole('student');

    Student::factory()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'phone' => '0240000000',
        ...$studentAttributes,
    ]);

    return $user;
}

function mobilePermitBearerToken(User $user): string
{
    return $user->createToken('test-mobile', ['mobile'])->plainTextToken;
}

function mobilePermitFakePaystackInitialize(): void
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

function mobilePermitFakePaystackVerify(string $reference, string $status = 'success'): void
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

test('authenticated student can fetch permit request options', function () {
    $user = mobilePermitStudentUser();

    $this->withToken(mobilePermitBearerToken($user))
        ->getJson('/api/mobile/permit-requests/options')
        ->assertOk()
        ->assertJsonPath('data.default_amount', 50)
        ->assertJsonPath('data.currency', 'GHS')
        ->assertJsonPath('data.permit_requests_enabled', true)
        ->assertJsonPath('data.student.id', $user->student->id)
        ->assertJsonPath('data.has_active_permit', false)
        ->assertJsonPath('data.has_pending_request', false);
});

test('student without linked profile cannot create mobile permit request', function () {
    $user = User::factory()->create();
    $user->assignRole('student');

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests')
        ->assertForbidden();
});

test('student can create own mobile permit request', function () {
    $user = mobilePermitStudentUser();

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests')
        ->assertCreated()
        ->assertJsonPath('data.student.id', $user->student->id)
        ->assertJsonPath('data.status', PermitRequestStatus::Pending->value)
        ->assertJsonPath('data.amount', '50.00');

    expect(PermitRequest::query()->firstOrFail()->student_id)->toBe($user->student->id)
        ->and(Payment::query()->count())->toBe(0);
});

test('student cannot create mobile permit request for another student', function () {
    $user = mobilePermitStudentUser();
    $otherStudent = Student::factory()->create();

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests', [
            'student_number' => $otherStudent->student_number,
        ])
        ->assertCreated();

    expect(PermitRequest::query()->firstOrFail()->student_id)->toBe($user->student->id);
});

test('student can initialize mobile permit payment', function () {
    mobilePermitFakePaystackInitialize();
    $user = mobilePermitStudentUser();
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $user->student->id,
        'academic_period_id' => AcademicPeriod::query()->where('is_active', true)->value('id'),
        'status' => PermitRequestStatus::Pending,
    ]);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson("/api/mobile/permit-requests/{$permitRequest->request_reference}/initialize-payment")
        ->assertOk()
        ->assertJsonPath('authorization_url', 'https://checkout.paystack.test/pay')
        ->assertJsonPath('access_code', 'access-code')
        ->assertJsonPath('permit_request_reference', $permitRequest->request_reference);

    expect($permitRequest->refresh()->payment_id)->not->toBeNull()
        ->and($permitRequest->status)->toBe(PermitRequestStatus::AwaitingPayment);
});

test('mobile payment initialization forwards deep link callback to paystack', function () {
    mobilePermitFakePaystackInitialize();
    $user = mobilePermitStudentUser();
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $user->student->id,
        'academic_period_id' => AcademicPeriod::query()->where('is_active', true)->value('id'),
        'status' => PermitRequestStatus::Pending,
    ]);

    $callbackUrl = 'kntsfapp://permit-request/payment-return?source=paystack';
    $redirectUrl = 'kntsfapp://(student)/permit-request/payment-return?source=paystack';

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson("/api/mobile/permit-requests/{$permitRequest->request_reference}/initialize-payment", [
            'callback_url' => $callbackUrl,
            'redirect_url' => $redirectUrl,
        ])
        ->assertOk()
        ->assertJsonPath('authorization_url', 'https://checkout.paystack.test/pay');

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.paystack.co/transaction/initialize'
        && $request['callback_url'] === $callbackUrl
        && $request['metadata']['callback_url'] === $callbackUrl
        && $request['metadata']['redirect_url'] === $redirectUrl);

    $payment = Payment::query()->firstOrFail();

    expect($payment->metadata['paystack_callback_url'])->toBe($callbackUrl)
        ->and($payment->metadata['mobile_redirect_url'])->toBe($redirectUrl);
});

test('mobile payment initialization rejects unsupported callback protocols', function () {
    $user = mobilePermitStudentUser();
    $permitRequest = PermitRequest::factory()->create([
        'student_id' => $user->student->id,
        'academic_period_id' => AcademicPeriod::query()->where('is_active', true)->value('id'),
        'status' => PermitRequestStatus::Pending,
    ]);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson("/api/mobile/permit-requests/{$permitRequest->request_reference}/initialize-payment", [
            'callback_url' => 'javascript:alert(1)',
            'redirect_url' => 'file:///tmp/payment-return',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['callback_url', 'redirect_url']);
});

test('verify payment uses server side verification and is idempotent', function () {
    mobilePermitFakePaystackInitialize();
    $user = mobilePermitStudentUser();

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests')
        ->assertCreated();

    $permitRequest = PermitRequest::query()->firstOrFail();

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson("/api/mobile/permit-requests/{$permitRequest->request_reference}/initialize-payment")
        ->assertOk();

    $payment = Payment::query()->firstOrFail();
    mobilePermitFakePaystackVerify($payment->reference);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson("/api/mobile/permit-requests/{$permitRequest->request_reference}/verify-payment", [
            'reference' => $payment->reference,
        ])
        ->assertOk()
        ->assertJsonPath('data.status', PermitRequestStatus::Issued->value)
        ->assertJsonPath('data.payment.status', PaymentStatus::Success->value)
        ->assertJsonMissing(['plain_code']);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson("/api/mobile/permit-requests/{$permitRequest->request_reference}/verify-payment", [
            'reference' => $payment->reference,
        ])
        ->assertOk();

    expect(Permit::query()->where('student_id', $user->student->id)->count())->toBe(1);
});

test('active permit blocks new mobile permit request', function () {
    $period = AcademicPeriod::query()->where('is_active', true)->firstOrFail();
    $user = mobilePermitStudentUser();

    Permit::factory()->create([
        'student_id' => $user->student->id,
        'academic_period_id' => $period->id,
        'status' => PermitStatus::Active,
        'expires_at' => now()->addMonth(),
    ]);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests')
        ->assertUnprocessable();

    expect(PermitRequest::query()->count())->toBe(0)
        ->and(Payment::query()->count())->toBe(0);
});

test('pending request blocks duplicate mobile permit request', function () {
    $period = AcademicPeriod::query()->where('is_active', true)->firstOrFail();
    $user = mobilePermitStudentUser();

    PermitRequest::factory()->create([
        'student_id' => $user->student->id,
        'academic_period_id' => $period->id,
        'status' => PermitRequestStatus::Pending,
    ]);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests')
        ->assertUnprocessable();

    expect(PermitRequest::query()->count())->toBe(1);
});

test('student email can be filled if missing', function () {
    $user = mobilePermitStudentUser([
        'email' => null,
    ]);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests', [
            'contact_email' => $user->email,
        ])
        ->assertCreated();

    expect($user->student->refresh()->email)->toBe($user->email);
});

test('student email cannot be overwritten if already set', function () {
    $user = mobilePermitStudentUser([
        'email' => 'old@example.com',
    ]);

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests', [
            'contact_email' => 'new@example.com',
        ])
        ->assertUnprocessable();

    expect($user->student->refresh()->email)->toBe('old@example.com')
        ->and(PermitRequest::query()->count())->toBe(0);
});

test('mobile permit request resource does not expose payment secrets or internal metadata', function () {
    mobilePermitFakePaystackInitialize();
    $user = mobilePermitStudentUser();

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson('/api/mobile/permit-requests')
        ->assertCreated();

    $permitRequest = PermitRequest::query()->firstOrFail();

    $this->withToken(mobilePermitBearerToken($user))
        ->postJson("/api/mobile/permit-requests/{$permitRequest->request_reference}/initialize-payment")
        ->assertOk();

    $response = $this->withToken(mobilePermitBearerToken($user))
        ->getJson("/api/mobile/permit-requests/{$permitRequest->request_reference}")
        ->assertOk()
        ->assertJsonMissing(['metadata'])
        ->assertJsonMissing(['paystack_access_code'])
        ->assertJsonMissing(['paystack_authorization_url']);

    expect($response->getContent())->not->toContain('paystack_access_code')
        ->not->toContain('paystack_authorization_url');
});
