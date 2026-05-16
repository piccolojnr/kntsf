<?php

namespace App\Notifications\Permits;

use App\Models\Permit;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitIssuedNotification extends Notification implements ShouldQueue
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
            subject: 'Permit issued',
            eyebrow: 'Permit issued',
            title: 'Your SRC permit has been issued',
            intro: 'A permit has been issued for your student profile.',
            details: [
                ['label' => 'Code last four', 'value' => $this->permit->code_last4 ?? '----'],
                ['label' => 'Valid until', 'value' => $this->permit->expires_at?->toFormattedDateString()],
            ],
            note: 'Keep your permit details safe. The full permit code is not shown again after issuance.',
            tone: 'success',
        );
    }
}
