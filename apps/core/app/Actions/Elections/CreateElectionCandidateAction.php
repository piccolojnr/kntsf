<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateElectionCandidateAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(ElectionPosition $position, User $actor, array $attributes): ElectionCandidate
    {
        return DB::transaction(function () use ($position, $actor, $attributes): ElectionCandidate {
            if ($position->candidates()->where('student_id', $attributes['student_id'])->exists()) {
                throw ValidationException::withMessages([
                    'student_id' => 'This student is already a candidate for this position.',
                ]);
            }

            $candidate = $position->candidates()->create([
                'student_id' => $attributes['student_id'],
                'slogan' => $attributes['slogan'] ?? null,
                'manifesto' => $attributes['manifesto'] ?? null,
                'metadata' => [],
            ]);

            $this->syncMedia($candidate, $attributes);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::CandidateCreated,
                auditable: $candidate,
                subject: $position->election,
                description: 'Election candidate created.',
                newValues: $candidate->only(['student_id', 'slogan', 'status']),
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
