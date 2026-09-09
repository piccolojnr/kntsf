<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\CandidateStatus;
use App\Models\ElectionCandidate;
use App\Models\User;
use App\Support\AuditEvents;

class ApproveCandidateAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(ElectionCandidate $candidate, User $actor): ElectionCandidate
    {
        $oldValues = $candidate->only(['status']);

        $candidate->update([
            'status' => CandidateStatus::Approved,
            'approved_by_id' => $actor->id,
            'approved_at' => now(),
            'rejected_at' => null,
            'withdrawn_at' => null,
        ]);

        $this->createAuditLog->handle(actor: $actor, event: AuditEvents::CandidateApproved, auditable: $candidate->position->election, subject: $candidate, description: 'Candidate approved.', oldValues: $oldValues, newValues: $candidate->only(['status', 'approved_by_id', 'approved_at']));

        return $candidate->refresh();
    }
}
