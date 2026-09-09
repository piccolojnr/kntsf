<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\CandidateStatus;
use App\Enums\PermitStatus;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\ElectionVote;
use App\Models\Student;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CastElectionVoteAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Election $election, ElectionPosition $position, ElectionCandidate $candidate, User $actor): ElectionVote
    {
        return DB::transaction(function () use ($election, $position, $candidate, $actor): ElectionVote {
            $election = Election::query()->lockForUpdate()->findOrFail($election->id);
            $position = ElectionPosition::query()->lockForUpdate()->findOrFail($position->id);
            $candidate = ElectionCandidate::query()->lockForUpdate()->findOrFail($candidate->id);
            $student = $actor->student()->lockForUpdate()->first();

            if (! $student instanceof Student) {
                throw ValidationException::withMessages(['student' => 'Only linked student accounts can vote.']);
            }

            if ($actor->password === null || ! $actor->is_active) {
                throw ValidationException::withMessages(['student' => 'Your student account must be activated before voting.']);
            }

            if (! $election->isOpenForVoting()) {
                throw ValidationException::withMessages(['election' => 'This election is not currently active.']);
            }

            if ($position->election_id !== $election->id || $candidate->election_position_id !== $position->id) {
                throw ValidationException::withMessages(['election_candidate_id' => 'Choose a valid candidate for this position.']);
            }

            if ($candidate->status !== CandidateStatus::Approved) {
                throw ValidationException::withMessages(['election_candidate_id' => 'Only approved candidates can receive votes.']);
            }

            if ($position->votes()->where('student_id', $student->id)->exists()) {
                throw ValidationException::withMessages(['election_candidate_id' => 'You have already voted for this position.']);
            }

            if (! $this->hasActivePermit($student, $election)) {
                throw ValidationException::withMessages(['student' => 'An active permit for this academic period is required to vote.']);
            }

            $vote = ElectionVote::query()->create([
                'election_id' => $election->id,
                'election_position_id' => $position->id,
                'election_candidate_id' => $candidate->id,
                'student_id' => $student->id,
                'cast_at' => now(),
                'metadata' => [],
            ]);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::ElectionVoteCast,
                auditable: $election,
                subject: $vote,
                description: 'Election vote cast.',
                metadata: [
                    'election_position_id' => $position->id,
                ],
            );

            return $vote;
        });
    }

    private function hasActivePermit(Student $student, Election $election): bool
    {
        return $student->permits()
            ->where('academic_period_id', $election->academic_period_id)
            ->where('status', PermitStatus::Active)
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>=', now())
            ->exists();
    }
}
