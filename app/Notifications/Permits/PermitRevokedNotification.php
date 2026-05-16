<?php

namespace App\Notifications\Permits;

use App\Models\Permit;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitRevokedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Permit $permit) {}

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
            subject: 'Permit revoked',
            eyebrow: 'Permit revoked',
            title: 'Your SRC permit was revoked',
            intro: 'A permit linked to your student profile has been revoked.',
            details: [
                ['label' => 'Code last four', 'value' => $this->permit->code_last4 ?? '----'],
                ['label' => 'Reason', 'value' => $this->permit->revocation_reason],
            ],
            note: 'Contact the SRC office if you need clarification.',
            tone: 'danger',
        );
    }
}
