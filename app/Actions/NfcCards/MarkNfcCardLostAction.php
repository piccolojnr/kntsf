<?php

namespace App\Actions\NfcCards;

use App\Enums\NfcCardStatus;
use App\Models\NfcCard;
use RuntimeException;

class MarkNfcCardLostAction
{
    public function handle(NfcCard $card): NfcCard
    {
        if ($card->status === NfcCardStatus::Lost) {
            throw new RuntimeException('This NFC card is already marked as lost.');
        }

        $card->forceFill([
            'status' => NfcCardStatus::Lost,
            'lost_at' => now(),
            'deactivated_at' => now(),
        ])->save();

        return $card->refresh();
    }
}
