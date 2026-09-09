<?php

namespace App\Notifications\Payments;

use App\Models\Payment;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentCancelledNotification extends Notification implements ShouldQueue
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
            subject: 'Payment cancelled',
            eyebrow: 'Payment cancelled',
            title: 'A payment was cancelled',
            intro: 'A payment record linked to your student profile was cancelled.',
            details: [
                ['label' => 'Reference', 'value' => $this->payment->reference],
            ],
            note: 'Contact the SRC office if you need clarification.',
            tone: 'warning',
        );
    }
}
