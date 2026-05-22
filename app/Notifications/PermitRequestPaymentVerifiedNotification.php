<?php

namespace App\Notifications;

use App\Models\PermitRequest;
use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitRequestPaymentVerifiedNotification extends Notification implements ShouldQueue
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
            subject: 'Permit payment verified',
            eyebrow: 'Payment verified',
            title: 'Your permit payment has been verified',
            intro: $this->permitRequest->requires_review
                ? 'Your payment was successful. Your student record will be reviewed before permit issuance.'
                : 'Your payment was successful. Your permit request is being completed.',
            details: [
                ['label' => 'Request', 'value' => $this->permitRequest->request_reference],
                ['label' => 'Amount', 'value' => $this->permitRequest->currency.' '.number_format((float) $this->permitRequest->amount, 2)],
            ],
            tone: 'success',
        );
    }
}
