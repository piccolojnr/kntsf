<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Models\ElectionPosition;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;

class UpdateElectionPositionAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(ElectionPosition $position, User $actor, array $attributes): ElectionPosition
    {
        return DB::transaction(function () use ($position, $actor, $attributes): ElectionPosition {
            $oldValues = $position->only(['title', 'description', 'max_winners', 'sort_order']);

            $position->update([
                'title' => $attributes['title'],
                'description' => $attributes['description'] ?? null,
                'max_winners' => $attributes['max_winners'] ?? 1,
                'sort_order' => $attributes['sort_order'] ?? $position->sort_order,
            ]);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::ElectionPositionUpdated,
                auditable: $position,
                subject: $position->election,
                description: 'Election position updated.',
                oldValues: $oldValues,
                newValues: $position->only(['title', 'description', 'max_winners', 'sort_order']),
            );

            return $position->refresh();
        });
    }
}
