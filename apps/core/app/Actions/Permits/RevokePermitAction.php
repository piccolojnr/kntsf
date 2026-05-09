<?php

namespace App\Actions\Permits;

use App\Enums\PermitStatus;
use App\Models\Permit;
use App\Models\User;
use RuntimeException;

class RevokePermitAction
{
    public function handle(Permit $permit, User $revokedBy, ?string $reason = null): Permit
    {
        if ($permit->status === PermitStatus::Revoked) {
            throw new RuntimeException('This permit has already been revoked.');
        }

        $permit->forceFill([
            'status' => PermitStatus::Revoked,
            'revoked_at' => now(),
            'revoked_by_id' => $revokedBy->id,
            'revocation_reason' => $reason,
        ])->save();

        return $permit->refresh();
    }
}
