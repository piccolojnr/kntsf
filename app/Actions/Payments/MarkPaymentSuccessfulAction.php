<?php

namespace App\Actions\Payments;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Permits\IssuePermitAction;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\Payments\PaymentSuccessfulNotification;
use App\Support\AuditEvents;
use App\Support\StudentNotifier;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class MarkPaymentSuccessfulAction
{
    public function __construct(
        private readonly IssuePermitAction $issuePermit,
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    /**
     * @param  array{issue_permit?: bool|null, academic_period_id?: int|null, notes?: string|null}  $attributes
     */
    public function handle(Payment $payment, User $verifiedBy, array $attributes = []): Payment
    {
        return DB::transaction(function () use ($payment, $verifiedBy, $attributes): Payment {
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);

            if ($payment->status === PaymentStatus::Cancelled) {
                throw new RuntimeException('Cancelled payments cannot be marked successful.');
            }

            if ($payment->status === PaymentStatus::Success) {
                return $payment->load(['student', 'permit', 'createdBy']);
            }

            $oldValues = $payment->only(['status', 'paid_at', 'verified_at', 'failure_reason', 'permit_id']);

            $payment->forceFill([
                'status' => PaymentStatus::Success,
                'paid_at' => $payment->paid_at ?? now(),
                'verified_at' => now(),
                'failure_reason' => null,
                'metadata' => array_replace($payment->metadata ?? [], [
                    'success_notes' => $attributes['notes'] ?? null,
                    'verified_by_id' => $verifiedBy->id,
                ]),
            ])->save();

            if (($attributes['issue_permit'] ?? false) && $payment->permit_id === null) {
                $issuedPermit = $this->issuePermit->handle($payment->student, $verifiedBy, [
                    'academic_period_id' => $attributes['academic_period_id'] ?? null,
                    'amount_paid' => $payment->amount,
                    'currency' => $payment->currency,
                ]);

                $payment->forceFill([
                    'permit_id' => $issuedPermit->permit->id,
                ])->save();
            }

            $this->createAuditLog->handle(
                actor: $verifiedBy,
                event: AuditEvents::PaymentSuccessful,
                auditable: $payment,
                subject: $payment->student,
                description: 'Payment marked successful.',
                metadata: [
                    'reference' => $payment->reference,
                    'permit_id' => $payment->permit_id,
                ],
                oldValues: $oldValues,
                newValues: $payment->only(['status', 'paid_at', 'verified_at', 'failure_reason', 'permit_id']),
            );

            $this->studentNotifier->notify($payment->student, new PaymentSuccessfulNotification($payment));

            return $payment->refresh()->load(['student', 'permit', 'createdBy']);
        });
    }
}
