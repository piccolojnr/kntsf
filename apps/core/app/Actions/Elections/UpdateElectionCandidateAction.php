<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Models\ElectionCandidate;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateElectionCandidateAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(ElectionCandidate $candidate, User $actor, array $attributes): ElectionCandidate
    {
        return DB::transaction(function () use ($candidate, $actor, $attributes): ElectionCandidate {
            if ($candidate->position->candidates()
                ->where('student_id', $attributes['student_id'])
                ->whereKeyNot($candidate->id)
                ->exists()) {
                throw ValidationException::withMessages([
                    'student_id' => 'This student is already a candidate for this position.',
                ]);
            }

            $oldValues = $candidate->only(['student_id', 'slogan', 'manifesto', 'status']);

            $candidate->update([
                'student_id' => $attributes['student_id'],
                'slogan' => $attributes['slogan'] ?? null,
                'manifesto' => $attributes['manifesto'] ?? null,
            ]);

            $this->syncMedia($candidate, $attributes);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::CandidateUpdated,
                auditable: $candidate,
                subject: $candidate->position->election,
                description: 'Election candidate updated.',
                oldValues: $oldValues,
                newValues: $candidate->only(['student_id', 'slogan', 'manifesto', 'status']),
            );

            return $candidate->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function syncMedia(ElectionCandidate $candidate, array $attributes): void
    {
        if (($attributes['poster'] ?? null) instanceof UploadedFile) {
            $candidate->addMedia($attributes['poster'])->toMediaCollection(MediaCollections::POSTER);
        }

        foreach ($attributes['gallery'] ?? [] as $image) {
            if ($image instanceof UploadedFile) {
                $candidate->addMedia($image)->toMediaCollection(MediaCollections::GALLERY);
            }
        }
    }
}
