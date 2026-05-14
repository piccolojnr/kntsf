<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\User;
use App\Support\AuditEvents;

class StartElectionAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Election $election, User $actor): Election
    {
        $oldValues = $election->only(['status']);
        $election->update(['status' => ElectionStatus::Active]);
        $this->createAuditLog->handle(actor: $actor, event: AuditEvents::ElectionStarted, auditable: $election, subject: $election, description: 'Election started.', oldValues: $oldValues, newValues: $election->only(['status']));

        return $election->refresh();
    }
}
