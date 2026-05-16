<?php

namespace App\Notifications\NfcCards;

use App\Models\NfcCard;
use App\Support\NotificationMail;
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
        return NotificationMail::make(
            subject: 'NFC card marked lost',
            eyebrow: 'Card lost',
            title: 'Your NFC card was marked lost',
            intro: 'Your NFC card has been marked as lost.',
            details: [
                ['label' => 'UID last four', 'value' => $this->card->uid_last4 ?? '----'],
            ],
            note: 'Contact the SRC office if this is incorrect.',
            tone: 'warning',
        );
    }
}
