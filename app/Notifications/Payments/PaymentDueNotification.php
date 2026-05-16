<?php

namespace App\Notifications\Payments;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentDueNotification extends Notification implements ShouldQueue
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
            ->subject('Payment pending')
            ->greeting('Payment pending')
            ->line('A payment record has been created and is pending confirmation.')
            ->line('Reference: '.$this->payment->reference)
            ->line('Amount: '.$this->payment->currency.' '.$this->payment->amount)
            ->line('Please contact the SRC office if this is unexpected.');
    }
}
