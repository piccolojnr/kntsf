<?php

namespace App\Actions\NfcCards;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use App\Models\User;
use App\Support\AuditEvents;
use RuntimeException;

class MarkNfcCardLostAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(NfcCard $card, ?User $actor = null): NfcCard
    {
        if ($card->status === NfcCardStatus::Lost) {
            throw new RuntimeException('This NFC card is already marked as lost.');
        }

        $oldValues = $card->only(['status', 'lost_at', 'deactivated_at']);

        $card->forceFill([
            'status' => NfcCardStatus::Lost,
            'lost_at' => now(),
            'deactivated_at' => now(),
        ])->save();

        $card = $card->refresh();

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::NfcLost,
            auditable: $card,
            subject: $card->student,
            description: 'NFC card marked lost.',
            metadata: [
                'uid_last4' => $card->uid_last4,
            ],
            oldValues: $oldValues,
            newValues: $card->only(['status', 'lost_at', 'deactivated_at']),
        );

        return $card;
    }
}
