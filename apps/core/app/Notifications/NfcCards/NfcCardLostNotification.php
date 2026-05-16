<?php

namespace App\Notifications\NfcCards;

use App\Models\NfcCard;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NfcCardLostNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly NfcCard $card) {}

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
            ->subject('NFC card marked lost')
            ->greeting('NFC card marked lost')
            ->line('Your NFC card has been marked as lost.')
            ->line('UID last four: '.($this->card->uid_last4 ?? '----'))
            ->line('Contact the SRC office if this is incorrect.');
    }
}
