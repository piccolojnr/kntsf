<?php

namespace App\Actions\Payments;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use RuntimeException;

class CancelPaymentAction
{
    /**
     * @param  array{notes?: string|null}  $attributes
     */
    public function handle(Payment $payment, array $attributes = []): Payment
    {
        if ($payment->status === PaymentStatus::Success) {
            throw new RuntimeException('Successful payments cannot be cancelled.');
        }

        if ($payment->status === PaymentStatus::Cancelled) {
            return $payment;
        }

        $payment->forceFill([
            'status' => PaymentStatus::Cancelled,
            'metadata' => array_replace($payment->metadata ?? [], [
                'cancel_notes' => $attributes['notes'] ?? null,
            ]),
        ])->save();

        return $payment->refresh();
    }
}
