<?php

namespace App\Support;

use Illuminate\Notifications\Messages\MailMessage;

final class NotificationMail
{
    /**
     * @param  array<int, array{label: string, value: string|null}>  $details
     */
    public static function make(
        string $subject,
        string $eyebrow,
        string $title,
        string $intro,
        array $details = [],
        ?string $actionLabel = null,
        ?string $actionUrl = null,
        ?string $note = null,
        string $tone = 'default',
    ): MailMessage {
        return (new MailMessage)
            ->subject($subject)
            ->markdown('mail.notifications.operational', [
                'eyebrow' => $eyebrow,
                'title' => $title,
                'intro' => $intro,
                'details' => array_values(array_filter(
                    $details,
                    fn (array $detail): bool => filled($detail['value'] ?? null),
                )),
                'actionLabel' => $actionLabel,
                'actionUrl' => $actionUrl,
                'note' => $note,
                'tone' => $tone,
            ]);
    }
}
