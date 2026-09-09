<?php

namespace App\Notifications\NfcCards;

use App\Models\NfcCard;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NfcCardRevokedNotification extends Notification implements ShouldQueue
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
            subject: 'NFC card revoked',
            eyebrow: 'Card revoked',
            title: 'Your NFC card was revoked',
            intro: 'Your NFC card has been revoked.',
            details: [
                ['label' => 'UID last four', 'value' => $this->card->uid_last4 ?? '----'],
            ],
            note: 'Contact the SRC office if you need clarification.',
            tone: 'danger',
        );
    }
}
