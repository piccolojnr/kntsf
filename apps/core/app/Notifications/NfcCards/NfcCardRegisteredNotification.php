<?php

namespace App\Notifications\NfcCards;

use App\Models\NfcCard;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NfcCardRegisteredNotification extends Notification implements ShouldQueue
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
        return NotificationMail::make(
            subject: 'NFC card registered',
            eyebrow: 'NFC card',
            title: 'Your NFC card has been registered',
            intro: 'An NFC card has been registered for your student profile.',
            details: [
                ['label' => 'UID last four', 'value' => $this->card->uid_last4 ?? '----'],
            ],
            note: 'Keep your card safe and report loss immediately.',
            tone: 'success',
        );
    }
}
