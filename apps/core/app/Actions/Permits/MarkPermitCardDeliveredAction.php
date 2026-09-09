<?php

namespace App\Actions\Permits;

use App\Actions\Audit\CreateAuditLogAction;
use App\Models\Permit;
use App\Models\User;
use App\Support\AuditEvents;

class MarkPermitCardDeliveredAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Permit $permit, ?User $actor = null): Permit
    {
        if ($permit->card_delivered_at === null) {
            $oldValues = $permit->only(['card_delivered_at']);

            $permit->forceFill(['card_delivered_at' => now()])->save();

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::PermitCardDelivered,
                auditable: $permit,
                subject: $permit->student,
                description: 'Permit card marked as delivered.',
                oldValues: $oldValues,
                newValues: $permit->only(['card_delivered_at']),
            );
        }

        return $permit->refresh();
    }
}
