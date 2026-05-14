<?php

namespace App\Actions\Polls;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Models\Poll;
use App\Models\User;
use App\Support\AuditEvents;

class ArchivePollAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Poll $poll, User $actor): Poll
    {
        $oldValues = $poll->only(['status']);

        $poll->update([
            'status' => PublishStatus::Archived,
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::PollArchived,
            auditable: $poll,
            subject: $poll,
            description: 'Poll archived.',
            oldValues: $oldValues,
            newValues: $poll->only(['status']),
        );

        return $poll->refresh()->load('creator', 'options');
    }
}
