<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\CandidateStatus;
use App\Models\ElectionCandidate;
use App\Models\User;
use App\Support\AuditEvents;

class WithdrawCandidateAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(ElectionCandidate $candidate, User $actor): ElectionCandidate
    {
        $oldValues = $candidate->only(['status']);

        $candidate->update([
            'status' => CandidateStatus::Withdrawn,
            'withdrawn_at' => now(),
        ]);

        $this->createAuditLog->handle(actor: $actor, event: AuditEvents::CandidateWithdrawn, auditable: $candidate->position->election, subject: $candidate, description: 'Candidate withdrawn.', oldValues: $oldValues, newValues: $candidate->only(['status', 'withdrawn_at']));

        return $candidate->refresh();
    }
}
