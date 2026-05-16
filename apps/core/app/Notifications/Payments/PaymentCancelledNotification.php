<?php

namespace App\Notifications\Payments;

use App\Models\Payment;
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
        return (new MailMessage)
            ->subject('Payment cancelled')
            ->greeting('Payment cancelled')
            ->line('A payment record linked to your student profile was cancelled.')
            ->line('Reference: '.$this->payment->reference)
            ->line('Contact the SRC office if you need clarification.');
    }
}
