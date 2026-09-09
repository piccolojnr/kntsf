<?php

namespace App\Notifications\Payments;

use App\Models\Payment;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailedNotification extends Notification implements ShouldQueue
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
            subject: 'Payment marked failed',
            eyebrow: 'Payment failed',
            title: 'A payment was marked failed',
            intro: 'A payment record linked to your student profile was marked failed.',
            details: [
                ['label' => 'Reference', 'value' => $this->payment->reference],
                ['label' => 'Reason', 'value' => $this->payment->failure_reason],
            ],
            note: 'Contact the SRC office if you need help.',
            tone: 'danger',
        );
    }
}
