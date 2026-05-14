<?php

namespace App\Actions\Events;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Models\Event;
use App\Models\User;
use App\Support\AuditEvents;

class ArchiveEventAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Event $event, User $actor): Event
    {
        $oldValues = $event->only(['status', 'archived_at']);

        $event->update([
            'status' => PublishStatus::Archived,
            'archived_at' => now(),
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::EventArchived,
            auditable: $event,
            subject: $event,
            description: 'Event archived.',
            oldValues: $oldValues,
            newValues: $event->only(['status', 'archived_at']),
        );

        return $event->refresh()->load('organizer');
    }
}
