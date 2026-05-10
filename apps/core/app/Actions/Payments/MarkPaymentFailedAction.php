<?php

namespace App\Actions\Payments;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use App\Support\AuditEvents;
use RuntimeException;

class MarkPaymentFailedAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    /**
     * @param  array{failure_reason: string, notes?: string|null}  $attributes
     */
    public function handle(Payment $payment, array $attributes, ?User $actor = null): Payment
    {
        if ($payment->status === PaymentStatus::Success) {
            throw new RuntimeException('Successful payments cannot be marked failed.');
        }

        if ($payment->status === PaymentStatus::Cancelled) {
            throw new RuntimeException('Cancelled payments cannot be marked failed.');
        }

        $oldValues = $payment->only(['status', 'failure_reason']);

        $payment->forceFill([
            'status' => PaymentStatus::Failed,
            'failure_reason' => $attributes['failure_reason'],
            'metadata' => array_replace($payment->metadata ?? [], [
                'failure_notes' => $attributes['notes'] ?? null,
            ]),
        ])->save();

        $payment = $payment->refresh();

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::PaymentFailed,
            auditable: $payment,
            subject: $payment->student,
            description: 'Payment marked failed.',
            metadata: [
                'reference' => $payment->reference,
            ],
            oldValues: $oldValues,
            newValues: $payment->only(['status', 'failure_reason']),
        );

        return $payment;
    }
}
