<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\DB;

class UpdateElectionAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Election $election, User $actor, array $attributes): Election
    {
        return DB::transaction(function () use ($election, $actor, $attributes): Election {
            $oldValues = $election->only(['title', 'slug', 'status', 'academic_period_id']);
            $titleChanged = $attributes['title'] !== $election->title;

            $election->update([
                'academic_period_id' => $attributes['academic_period_id'],
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? ($titleChanged
                    ? $this->slugGenerator->generate($attributes['title'], Election::class, ignoreId: $election->id)
                    : $election->slug),
                'description' => $attributes['description'] ?? null,
                'status' => ElectionStatus::tryFrom((string) ($attributes['status'] ?? $election->status->value)) ?? $election->status,
                'starts_at' => $attributes['starts_at'] ?? null,
                'ends_at' => $attributes['ends_at'] ?? null,
                'results_visible' => (bool) ($attributes['results_visible'] ?? false),
            ]);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::ElectionUpdated,
                auditable: $election,
                subject: $election,
                description: 'Election updated.',
                oldValues: $oldValues,
                newValues: $election->only(['title', 'slug', 'status', 'academic_period_id']),
            );

            return $election->refresh()->load('academicPeriod', 'creator', 'positions');
        });
    }
}
