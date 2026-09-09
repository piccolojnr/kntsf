<?php

namespace App\Notifications\Payments;

use App\Models\Payment;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSuccessfulNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Payment $payment) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return NotificationMail::make(
            subject: 'Payment confirmed',
            eyebrow: 'Payment confirmed',
            title: 'Your payment has been confirmed',
            intro: 'Your payment has been confirmed successfully.',
            details: [
                ['label' => 'Reference', 'value' => $this->payment->reference],
                ['label' => 'Amount', 'value' => $this->payment->currency.' '.number_format((float) $this->payment->amount, 2)],
                ['label' => 'Permit', 'value' => $this->payment->permit_id !== null ? 'Linked to this payment' : null],
            ],
            tone: 'success',
        );
    }
}
