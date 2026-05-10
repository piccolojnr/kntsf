<?php

namespace App\Notifications\NfcCards;

use App\Models\NfcCard;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NfcCardRevokedNotification extends Notification
{
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
            ->subject('NFC card revoked')
            ->greeting('NFC card revoked')
            ->line('Your NFC card has been revoked.')
            ->line('UID last four: '.($this->card->uid_last4 ?? '----'))
            ->line('Contact the SRC office if you need clarification.');
    }
}
