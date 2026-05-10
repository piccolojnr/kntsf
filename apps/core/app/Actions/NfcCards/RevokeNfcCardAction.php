<?php

namespace App\Actions\NfcCards;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use App\Models\User;
use App\Notifications\NfcCards\NfcCardRevokedNotification;
use App\Support\AuditEvents;
use App\Support\StudentNotifier;
use RuntimeException;

class RevokeNfcCardAction
{
    public function __construct(
        private readonly CreateAuditLogAction $createAuditLog,
        private readonly StudentNotifier $studentNotifier,
    ) {}

    public function handle(NfcCard $card, ?User $actor = null): NfcCard
    {
        if ($card->status === NfcCardStatus::Revoked) {
            throw new RuntimeException('This NFC card has already been revoked.');
        }

        $oldValues = $card->only(['status', 'deactivated_at']);

        $card->forceFill([
            'status' => NfcCardStatus::Revoked,
            'deactivated_at' => now(),
        ])->save();

        $card = $card->refresh();

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::NfcRevoked,
            auditable: $card,
            subject: $card->student,
            description: 'NFC card revoked.',
            metadata: [
                'uid_last4' => $card->uid_last4,
            ],
            oldValues: $oldValues,
            newValues: $card->only(['status', 'deactivated_at']),
        );

        $this->studentNotifier->notify($card->student, new NfcCardRevokedNotification($card));

        return $card;
    }
}
