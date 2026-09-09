<?php

namespace App\Actions\NfcCards;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReplaceNfcCardAction
{
    public function __construct(
        private readonly RegisterNfcCardAction $registerNfcCard,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    public function handle(NfcCard $oldCard, string $newUid, ?User $createdBy = null): NfcCard
    {
        if ($oldCard->status !== NfcCardStatus::Active) {
            throw new RuntimeException('Only an active NFC card can be replaced.');
        }

        return DB::transaction(function () use ($oldCard, $newUid, $createdBy): NfcCard {
            $oldValues = $oldCard->only(['status', 'deactivated_at', 'replaced_at']);

            $oldCard->forceFill([
                'status' => NfcCardStatus::Replaced,
                'deactivated_at' => now(),
                'replaced_at' => now(),
            ])->save();

            $newCard = $this->registerNfcCard->handle($oldCard->student, $newUid, $createdBy, false);

            $this->createAuditLog->handle(
                actor: $createdBy,
                event: AuditEvents::NfcReplaced,
                auditable: $newCard,
                subject: $oldCard->student,
                description: 'NFC card replaced.',
                metadata: [
                    'old_card_id' => $oldCard->id,
                    'new_card_id' => $newCard->id,
                    'new_uid_last4' => $newCard->uid_last4,
                ],
                oldValues: $oldValues,
                newValues: [
                    'old_card_status' => $oldCard->refresh()->status,
                    'new_card_id' => $newCard->id,
                    'new_card_status' => $newCard->status,
                ],
            );

            return $newCard;
        });
    }
}
