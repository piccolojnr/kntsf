<?php

namespace App\Notifications;

use App\Models\PermitRequest;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitRequestFailedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly PermitRequest $permitRequest,
        private readonly string $reason,
    ) {}

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
            subject: 'Permit request failed',
            eyebrow: 'Request failed',
            title: 'Your permit request could not be completed',
            intro: 'We could not complete your permit request automatically.',
            details: [
                ['label' => 'Request', 'value' => $this->permitRequest->request_reference],
                ['label' => 'Reason', 'value' => $this->reason],
            ],
            note: 'If payment was deducted, contact administration with your request reference.',
            tone: 'danger',
        );
    }
}
