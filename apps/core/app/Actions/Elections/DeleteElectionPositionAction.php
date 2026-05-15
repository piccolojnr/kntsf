<?php

namespace App\Actions\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Models\ElectionPosition;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteElectionPositionAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(ElectionPosition $position, User $actor): void
    {
        DB::transaction(function () use ($position, $actor): void {
            if ($position->votes()->exists()) {
                throw ValidationException::withMessages([
                    'position' => 'Positions with votes cannot be deleted.',
                ]);
            }

            $oldValues = $position->only(['title', 'max_winners', 'sort_order']);
            $election = $position->election;

            $position->delete();

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::ElectionPositionDeleted,
                auditable: $position,
                subject: $election,
                description: 'Election position deleted.',
                oldValues: $oldValues,
            );
        });
    }
}
