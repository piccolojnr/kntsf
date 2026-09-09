<?php

namespace App\Actions\Announcements;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Models\Announcement;
use App\Models\User;
use App\Support\AuditEvents;

class ArchiveAnnouncementAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Announcement $announcement, User $actor): Announcement
    {
        $oldValues = $announcement->only(['status', 'archived_at']);

        $announcement->update([
            'status' => PublishStatus::Archived,
            'archived_at' => now(),
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::AnnouncementArchived,
            auditable: $announcement,
            subject: $announcement,
            description: 'Announcement archived.',
            oldValues: $oldValues,
            newValues: $announcement->only(['status', 'archived_at']),
        );

        return $announcement->refresh()->load('author');
    }
}
