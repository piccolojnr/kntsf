<?php

namespace App\Notifications\Payments;

use App\Models\Payment;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSuccessfulNotification extends Notification
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
            ->subject('Payment confirmed')
            ->greeting('Payment confirmed')
            ->line('Your payment has been confirmed successfully.')
            ->line('Reference: '.$this->payment->reference)
            ->line('Amount: '.$this->payment->currency.' '.$this->payment->amount)
            ->lineIf($this->payment->permit_id !== null, 'A permit has been linked to this payment.');
    }
}
