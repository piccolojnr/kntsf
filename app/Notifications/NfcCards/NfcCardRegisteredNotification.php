<?php

namespace App\Notifications\NfcCards;

use App\Models\NfcCard;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NfcCardRegisteredNotification extends Notification
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
            ->subject('NFC card registered')
            ->greeting('NFC card registered')
            ->line('An NFC card has been registered for your student profile.')
            ->line('UID last four: '.($this->card->uid_last4 ?? '----'))
            ->line('Keep your card safe and report loss immediately.');
    }
}
