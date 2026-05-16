<?php

namespace App\Notifications\Permits;

use App\Models\Permit;
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
        return (new MailMessage)
            ->subject('Permit issued')
            ->greeting('Permit issued')
            ->line('A permit has been issued for your student profile.')
            ->line('Permit code last four: '.($this->permit->code_last4 ?? '----'))
            ->line('Valid until: '.$this->permit->expires_at?->toFormattedDateString())
            ->line('Keep your permit details safe.');
    }
}
