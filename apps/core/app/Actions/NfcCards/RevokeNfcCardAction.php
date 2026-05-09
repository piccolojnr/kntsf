<?php

namespace App\Actions\NfcCards;

use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use RuntimeException;

class RevokeNfcCardAction
{
    public function handle(NfcCard $card): NfcCard
    {
        if ($card->status === NfcCardStatus::Revoked) {
            throw new RuntimeException('This NFC card has already been revoked.');
        }

        $card->forceFill([
            'status' => NfcCardStatus::Revoked,
            'deactivated_at' => now(),
        ])->save();

        return $card->refresh();
    }
}
