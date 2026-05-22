<?php

namespace App\Actions\PermitRequests;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PaymentStatus;
use App\Enums\PermitRequestStatus;
use App\Models\Payment;
use App\Models\PermitRequest;
use App\Notifications\Payments\PaymentSuccessfulNotification;
use App\Notifications\PermitRequestPaymentVerifiedNotification;
use App\Support\AuditEvents;
use App\Support\PaystackClient;
use App\Support\StudentNotifier;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

class VerifyPaystackPaymentAction
{
    public function __construct(
        private readonly PaystackClient $paystackClient,
        private readonly CompletePermitRequestAction $completePermitRequest,
        private readonly FailPermitRequestAction $failPermitRequest,
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    public function handle(string $reference): PermitRequest
    {
        $response = $this->paystackClient->verifyTransaction($reference);
        $data = is_array($response['data'] ?? null) ? $response['data'] : [];
        $status = (string) ($data['status'] ?? '');

        $payment = Payment::query()
            ->where('reference', $reference)
            ->orWhere('gateway_reference', $reference)
            ->firstOrFail();

        $permitRequest = PermitRequest::query()
            ->where('payment_id', $payment->id)
            ->firstOrFail();

        if (($response['status'] ?? false) !== true || $status !== 'success') {
            return $this->failPermitRequest->handle($permitRequest, (string) ($response['message'] ?? 'Paystack payment was not successful.'));
        }

        try {
            DB::transaction(function () use ($payment, $permitRequest, $data): void {
                $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
                $permitRequest = PermitRequest::query()->lockForUpdate()->findOrFail($permitRequest->id);

                if ($payment->status !== PaymentStatus::Success) {
                    $payment->forceFill([
                        'gateway_reference' => $data['reference'] ?? $payment->gateway_reference,
                        'status' => PaymentStatus::Success,
                        'paid_at' => isset($data['paid_at']) ? Carbon::parse($data['paid_at']) : now(),
                        'verified_at' => now(),
                        'failure_reason' => null,
                        'metadata' => array_replace($payment->metadata ?? [], [
                            'paystack_status' => $data['status'] ?? null,
                            'paystack_channel' => $data['channel'] ?? null,
                            'paystack_amount' => $data['amount'] ?? null,
                            'verified_source' => 'paystack',
                        ]),
                    ])->save();

                    $permitRequest->forceFill([
                        'status' => PermitRequestStatus::Paid,
                    ])->save();

                    $this->createAuditLog->handle(
                        actor: null,
                        event: AuditEvents::PermitRequestPaymentVerified,
                        auditable: $permitRequest,
                        subject: $permitRequest->student,
                        description: 'Self-service Paystack payment verified.',
                        metadata: [
                            'request_reference' => $permitRequest->request_reference,
                            'payment_reference' => $payment->reference,
                        ],
                        newValues: $payment->only(['status', 'paid_at', 'verified_at', 'gateway_reference']),
                    );

                    if ($permitRequest->student !== null) {
                        $this->studentNotifier->notify($permitRequest->student, new PaymentSuccessfulNotification($payment));
                        $this->studentNotifier->notify($permitRequest->student, new PermitRequestPaymentVerifiedNotification($permitRequest));
                    }
                }
            });

            return $this->completePermitRequest->handle($permitRequest->refresh());
        } catch (Throwable $exception) {
            return $this->failPermitRequest->handle($permitRequest, $exception->getMessage());
        }
    }
}
