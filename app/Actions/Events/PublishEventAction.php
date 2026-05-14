<?php

namespace App\Actions\Events;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Models\Event;
use App\Models\User;
use App\Support\AuditEvents;

class PublishEventAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Event $event, User $actor, mixed $publishedAt = null): Event
    {
        $oldValues = $event->only(['status', 'published_at']);

        $event->update([
            'status' => PublishStatus::Published,
            'published_at' => $publishedAt ?: now(),
            'archived_at' => null,
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::EventPublished,
            auditable: $event,
            subject: $event,
            description: 'Event published.',
            oldValues: $oldValues,
            newValues: $event->only(['status', 'published_at']),
        );

        return $event->refresh()->load('organizer');
    }
}
