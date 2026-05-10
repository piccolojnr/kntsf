<?php

namespace App\Actions\Permits;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PermitStatus;
use App\Models\Permit;
use App\Models\User;
use App\Notifications\Permits\PermitRevokedNotification;
use App\Support\AuditEvents;
use App\Support\StudentNotifier;
use RuntimeException;

class RevokePermitAction
{
    public function __construct(
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    public function handle(Permit $permit, User $revokedBy, ?string $reason = null): Permit
    {
        if ($permit->status === PermitStatus::Revoked) {
            throw new RuntimeException('This permit has already been revoked.');
        }

        $oldValues = $permit->only(['status', 'revoked_at', 'revoked_by_id', 'revocation_reason']);

        $permit->forceFill([
            'status' => PermitStatus::Revoked,
            'revoked_at' => now(),
            'revoked_by_id' => $revokedBy->id,
            'revocation_reason' => $reason,
        ])->save();

        $permit = $permit->refresh();

        $this->createAuditLog->handle(
            actor: $revokedBy,
            event: AuditEvents::PermitRevoked,
            auditable: $permit,
            subject: $permit->student,
            description: 'Permit revoked.',
            metadata: [
                'reason' => $reason,
            ],
            oldValues: $oldValues,
            newValues: $permit->only(['status', 'revoked_at', 'revoked_by_id', 'revocation_reason']),
        );

        $this->studentNotifier->notify($permit->student, new PermitRevokedNotification($permit));

        return $permit;
    }
}
