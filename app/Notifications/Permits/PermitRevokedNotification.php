<?php

namespace App\Notifications\Permits;

use App\Models\Permit;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermitRevokedNotification extends Notification
{
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
        return (new MailMessage)
            ->subject('Permit revoked')
            ->greeting('Permit revoked')
            ->line('Your permit has been revoked.')
            ->line('Permit code last four: '.($this->permit->code_last4 ?? '----'))
            ->lineIf(filled($this->permit->revocation_reason), 'Reason: '.$this->permit->revocation_reason)
            ->line('Contact the SRC office if you need clarification.');
    }
}
