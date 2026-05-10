<?php

namespace App\Notifications\Payments;

use App\Models\Payment;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailedNotification extends Notification
{
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
        return (new MailMessage)
            ->subject('Payment marked failed')
            ->greeting('Payment marked failed')
            ->line('A payment record linked to your student profile was marked failed.')
            ->line('Reference: '.$this->payment->reference)
            ->lineIf(filled($this->payment->failure_reason), 'Reason: '.$this->payment->failure_reason)
            ->line('Contact the SRC office if you need help.');
    }
}
