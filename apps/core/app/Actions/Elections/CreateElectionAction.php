<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\DB;

class CreateElectionAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $creator, array $attributes): Election
    {
        return DB::transaction(function () use ($creator, $attributes): Election {
            $election = Election::query()->create([
                'academic_period_id' => $attributes['academic_period_id'],
                'created_by_id' => $creator->id,
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? $this->slugGenerator->generate($attributes['title'], Election::class),
                'description' => $attributes['description'] ?? null,
                'status' => ElectionStatus::tryFrom((string) ($attributes['status'] ?? ElectionStatus::Draft->value)) ?? ElectionStatus::Draft,
                'starts_at' => $attributes['starts_at'] ?? null,
                'ends_at' => $attributes['ends_at'] ?? null,
                'results_visible' => (bool) ($attributes['results_visible'] ?? false),
                'metadata' => [],
            ]);

            $this->createAuditLog->handle(
                actor: $creator,
                event: AuditEvents::ElectionCreated,
                auditable: $election,
                subject: $election,
                description: 'Election created.',
                newValues: $election->only(['title', 'slug', 'status', 'academic_period_id']),
            );

            return $election->load('academicPeriod', 'creator', 'positions');
        });
    }
}
