<?php

namespace App\Actions\NfcCards;

use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReplaceNfcCardAction
{
    public function __construct(
        private readonly RegisterNfcCardAction $registerNfcCard,
    ) {}

    public function handle(NfcCard $oldCard, string $newUid, ?User $createdBy = null): NfcCard
    {
        if ($oldCard->status !== NfcCardStatus::Active) {
            throw new RuntimeException('Only an active NFC card can be replaced.');
        }

        return DB::transaction(function () use ($oldCard, $newUid, $createdBy): NfcCard {
            $oldCard->forceFill([
                'status' => NfcCardStatus::Replaced,
                'deactivated_at' => now(),
                'replaced_at' => now(),
            ])->save();

            return $this->registerNfcCard->handle($oldCard->student, $newUid, $createdBy);
        });
    }
}
