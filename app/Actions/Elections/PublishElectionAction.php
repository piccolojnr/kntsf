<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\User;
use App\Support\AuditEvents;

class PublishElectionAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Election $election, User $actor): Election
    {
        return $this->transition($election, $actor, ElectionStatus::Scheduled, AuditEvents::ElectionPublished, 'Election published.');
    }

    private function transition(Election $election, User $actor, ElectionStatus $status, string $event, string $description): Election
    {
        $oldValues = $election->only(['status']);
        $election->update(['status' => $status]);
        $this->createAuditLog->handle(actor: $actor, event: $event, auditable: $election, subject: $election, description: $description, oldValues: $oldValues, newValues: $election->only(['status']));

        return $election->refresh();
    }
}
