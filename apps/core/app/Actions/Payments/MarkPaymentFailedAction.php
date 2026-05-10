<?php

namespace App\Actions\Payments;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use RuntimeException;

class MarkPaymentFailedAction
{
    /**
     * @param  array{failure_reason: string, notes?: string|null}  $attributes
     */
    public function handle(Payment $payment, array $attributes): Payment
    {
        if ($payment->status === PaymentStatus::Success) {
            throw new RuntimeException('Successful payments cannot be marked failed.');
        }

        if ($payment->status === PaymentStatus::Cancelled) {
            throw new RuntimeException('Cancelled payments cannot be marked failed.');
        }

        $payment->forceFill([
            'status' => PaymentStatus::Failed,
            'failure_reason' => $attributes['failure_reason'],
            'metadata' => array_replace($payment->metadata ?? [], [
                'failure_notes' => $attributes['notes'] ?? null,
            ]),
        ])->save();

        return $payment->refresh();
    }
}
