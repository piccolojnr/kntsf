<?php

namespace App\Actions\Announcements;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Models\Announcement;
use App\Models\User;
use App\Support\AuditEvents;

class PublishAnnouncementAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Announcement $announcement, User $actor, mixed $publishedAt = null): Announcement
    {
        $oldValues = $announcement->only(['status', 'published_at']);

        $announcement->update([
            'status' => PublishStatus::Published,
            'published_at' => $publishedAt ?: now(),
            'archived_at' => null,
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::AnnouncementPublished,
            auditable: $announcement,
            subject: $announcement,
            description: 'Announcement published.',
            oldValues: $oldValues,
            newValues: $announcement->only(['status', 'published_at']),
        );

        return $announcement->refresh()->load('author');
    }
}
