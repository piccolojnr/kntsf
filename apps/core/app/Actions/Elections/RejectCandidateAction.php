<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\CandidateStatus;
use App\Models\ElectionCandidate;
use App\Models\User;
use App\Support\AuditEvents;

class RejectCandidateAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(ElectionCandidate $candidate, User $actor): ElectionCandidate
    {
        $oldValues = $candidate->only(['status']);

        $candidate->update([
            'status' => CandidateStatus::Rejected,
            'rejected_at' => now(),
        ]);

        $this->createAuditLog->handle(actor: $actor, event: AuditEvents::CandidateRejected, auditable: $candidate->position->election, subject: $candidate, description: 'Candidate rejected.', oldValues: $oldValues, newValues: $candidate->only(['status', 'rejected_at']));

        return $candidate->refresh();
    }
}
