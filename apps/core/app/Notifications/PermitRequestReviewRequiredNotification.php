<?php

namespace App\Notifications;

use App\Models\PermitRequest;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitRequestReviewRequiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly PermitRequest $permitRequest) {}

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
            subject: 'Permit request needs review',
            eyebrow: 'Review required',
            title: 'A self-service permit request needs review',
            intro: 'A student created through self-service has paid for a permit and needs administrative review before issuance.',
            details: [
                ['label' => 'Request', 'value' => $this->permitRequest->request_reference],
                ['label' => 'Student', 'value' => $this->permitRequest->student?->student_number],
                ['label' => 'Amount', 'value' => $this->permitRequest->currency.' '.number_format((float) $this->permitRequest->amount, 2)],
            ],
            actionLabel: 'Review request',
            actionUrl: route('permit-requests.show', $this->permitRequest),
            tone: 'warning',
        );
    }
}
