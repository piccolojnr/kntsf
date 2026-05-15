<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Models\Election;
use App\Models\ElectionPosition;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;

class CreateElectionPositionAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Election $election, User $actor, array $attributes): ElectionPosition
    {
        return DB::transaction(function () use ($election, $actor, $attributes): ElectionPosition {
            $position = $election->positions()->create([
                'title' => $attributes['title'],
                'description' => $attributes['description'] ?? null,
                'max_winners' => $attributes['max_winners'] ?? 1,
                'sort_order' => $attributes['sort_order'] ?? ((int) $election->positions()->max('sort_order') + 1),
            ]);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::ElectionPositionCreated,
                auditable: $position,
                subject: $election,
                description: 'Election position created.',
                newValues: $position->only(['title', 'max_winners', 'sort_order']),
            );

            return $position;
        });
    }
}
