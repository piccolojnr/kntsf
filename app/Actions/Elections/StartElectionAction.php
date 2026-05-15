<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\CandidateStatus;
use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Validation\ValidationException;

class StartElectionAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Election $election, User $actor): Election
    {
        $this->ensureReadyForVoting($election);

        $oldValues = $election->only(['status']);
        $election->update(['status' => ElectionStatus::Active]);
        $this->createAuditLog->handle(actor: $actor, event: AuditEvents::ElectionStarted, auditable: $election, subject: $election, description: 'Election started.', oldValues: $oldValues, newValues: $election->only(['status']));

        return $election->refresh();
    }

    private function ensureReadyForVoting(Election $election): void
    {
        $election->loadMissing('positions.candidates');

        if ($election->positions->isEmpty()) {
            throw ValidationException::withMessages([
                'election' => 'Add at least one position before starting this election.',
            ]);
        }

        $positionWithoutApprovedCandidate = $election->positions->first(
            fn ($position): bool => $position->candidates
                ->where('status', CandidateStatus::Approved)
                ->isEmpty(),
        );

        if ($positionWithoutApprovedCandidate !== null) {
            throw ValidationException::withMessages([
                'election' => 'Every position must have at least one approved candidate before starting.',
            ]);
        }
    }
}
