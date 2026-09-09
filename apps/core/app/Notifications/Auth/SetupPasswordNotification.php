<?php

namespace App\Notifications\Auth;

use App\Support\NotificationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SetupPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $token,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return NotificationMail::make(
            subject: 'Set up your student account password',
            eyebrow: 'Account setup',
            title: 'Set up your student account',
            intro: 'A student account has been created for you. Use the secure link below to set your password and finish account setup.',
            actionLabel: 'Set password',
            actionUrl: route('account.setup-password.show', ['token' => $this->token]),
            note: 'This link expires in 24 hours. If you did not expect this email, you can ignore it.',
        );
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
