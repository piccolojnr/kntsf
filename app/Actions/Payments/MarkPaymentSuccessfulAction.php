<?php

namespace App\Actions\Payments;

use App\Actions\Permits\IssuePermitAction;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class MarkPaymentSuccessfulAction
{
    public function __construct(
        private readonly IssuePermitAction $issuePermit,
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

            return $payment->refresh()->load(['student', 'permit', 'createdBy']);
        });
    }
}
