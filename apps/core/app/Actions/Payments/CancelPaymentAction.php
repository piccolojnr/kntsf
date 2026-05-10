<?php

namespace App\Actions\Payments;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\Payments\PaymentCancelledNotification;
use App\Support\AuditEvents;
use App\Support\StudentNotifier;
use RuntimeException;

class CancelPaymentAction
{
    public function __construct(
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    /**
     * @param  array{notes?: string|null}  $attributes
     */
    public function handle(Payment $payment, array $attributes = [], ?User $actor = null): Payment
    {
        if ($payment->status === PaymentStatus::Success) {
            throw new RuntimeException('Successful payments cannot be cancelled.');
        }

        if ($payment->status === PaymentStatus::Cancelled) {
            return $payment;
        }

        $oldValues = $payment->only(['status']);

        $payment->forceFill([
            'status' => PaymentStatus::Cancelled,
            'metadata' => array_replace($payment->metadata ?? [], [
                'cancel_notes' => $attributes['notes'] ?? null,
            ]),
        ])->save();

        $payment = $payment->refresh();

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::PaymentCancelled,
            auditable: $payment,
            subject: $payment->student,
            description: 'Payment cancelled.',
            metadata: [
                'reference' => $payment->reference,
            ],
            oldValues: $oldValues,
            newValues: $payment->only(['status']),
        );

        $this->studentNotifier->notify($payment->student, new PaymentCancelledNotification($payment));

        return $payment;
    }
}
