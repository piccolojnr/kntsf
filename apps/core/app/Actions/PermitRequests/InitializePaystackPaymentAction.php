<?php

namespace App\Actions\PermitRequests;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PaymentStatus;
use App\Enums\PermitRequestStatus;
use App\Models\Payment;
use App\Models\PermitRequest;
use App\Support\AuditEvents;
use App\Support\PaymentReferenceGenerator;
use App\Support\PaystackClient;
use Illuminate\Support\Facades\DB;
use Log;
use RuntimeException;

class InitializePaystackPaymentAction
{
    public function __construct(
        private readonly PaymentReferenceGenerator $paymentReferenceGenerator,
        private readonly PaystackClient $paystackClient,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {
    }

    /**
     * @return array{authorization_url: string, access_code: string, reference: string}
     */
    public function handle(PermitRequest $permitRequest, ?string $callbackUrl = null, ?string $redirectUrl = null): array
    {
        return DB::transaction(function () use ($permitRequest, $callbackUrl, $redirectUrl): array {
            $permitRequest = PermitRequest::query()
                ->with(['student', 'academicPeriod', 'payment'])
                ->lockForUpdate()
                ->findOrFail($permitRequest->id);
            Log::info('Locked permit request for payment initialization', ['permit_request_id' => $permitRequest->id]);

            if ($permitRequest->status === PermitRequestStatus::Issued) {
                throw new RuntimeException('This permit request has already been issued.');
            }

            if ($permitRequest->payment instanceof Payment) {
                $payment = $permitRequest->payment;
                Log::info('Existing payment record found for permit request', ['permit_request_id' => $permitRequest->id, 'payment_id' => $payment->id]);
            } else {
                $payment = Payment::query()->create([
                    'student_id' => $permitRequest->student_id,
                    'reference' => $this->paymentReferenceGenerator->generate(),
                    'gateway' => 'paystack',
                    'status' => PaymentStatus::Pending,
                    'amount' => $permitRequest->amount,
                    'currency' => $permitRequest->currency,
                    'metadata' => [
                        'source' => 'self_service_permit_request',
                        'permit_request_id' => $permitRequest->id,
                        'academic_period_id' => $permitRequest->academic_period_id,
                    ],
                ]);

                Log::info('Created new payment record for permit request', ['permit_request_id' => $permitRequest->id, 'payment_id' => $payment->id]);

                $permitRequest->forceFill([
                    'payment_id' => $payment->id,
                    'status' => PermitRequestStatus::AwaitingPayment,
                ])->save();
                Log::info('Updated permit request status to AwaitingPayment', ['permit_request_id' => $permitRequest->id]);
            }

            $paystackCallbackUrl = $callbackUrl ?: route('public.permit-request.callback');

            Log::info('Initializing Paystack payment', [
                'permit_request_id' => $permitRequest->id,
                'payment_id' => $payment->id,
                'paystack_callback_url' => $paystackCallbackUrl,
                'redirect_url' => $redirectUrl,
            ]);
            $response = $this->paystackClient->initializeTransaction([
                'email' => $permitRequest->contact_email ?? $permitRequest->student?->email,
                'amount' => (int) round(((float) $permitRequest->amount) * 100),
                'currency' => $permitRequest->currency,
                'reference' => $payment->reference,
                'callback_url' => $paystackCallbackUrl,
                'metadata' => [
                    'permit_request_id' => $permitRequest->id,
                    'permit_request_reference' => $permitRequest->request_reference,
                    'student_id' => $permitRequest->student_id,
                    'academic_period_id' => $permitRequest->academic_period_id,
                    'callback_url' => $paystackCallbackUrl,
                    'redirect_url' => $redirectUrl,
                ],
            ]);

            Log::info('Paystack initialization response', [
                'permit_request_id' => $permitRequest->id,
                'payment_id' => $payment->id,
                'response' => $response,
            ]);
            $data = is_array($response['data'] ?? null) ? $response['data'] : [];

            if (($response['status'] ?? false) !== true || blank($data['authorization_url'] ?? null)) {
                throw new RuntimeException((string) ($response['message'] ?? 'Paystack initialization failed.'));
            }

            $payment->forceFill([
                'gateway_reference' => $data['reference'] ?? $payment->gateway_reference,
                'metadata' => array_replace($payment->metadata ?? [], [
                    'paystack_access_code' => $data['access_code'] ?? null,
                    'paystack_authorization_url' => $data['authorization_url'],
                    'paystack_callback_url' => $paystackCallbackUrl,
                    'mobile_redirect_url' => $redirectUrl,
                    'initialized_at' => now()->toISOString(),
                ]),
            ])->save();

            $this->createAuditLog->handle(
                actor: null,
                event: AuditEvents::PermitRequestPaymentInitialized,
                auditable: $permitRequest,
                subject: $permitRequest->student,
                description: 'Self-service Paystack payment initialized.',
                metadata: [
                    'request_reference' => $permitRequest->request_reference,
                    'payment_reference' => $payment->reference,
                ],
                newValues: $payment->only(['reference', 'gateway', 'status', 'amount', 'currency']),
            );

            return [
                'authorization_url' => (string) $data['authorization_url'],
                'access_code' => (string) ($data['access_code'] ?? ''),
                'reference' => $payment->reference,
            ];
        });
    }
}
