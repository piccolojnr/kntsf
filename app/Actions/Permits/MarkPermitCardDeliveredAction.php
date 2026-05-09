<?php

namespace App\Actions\Permits;

use App\Models\Permit;

class MarkPermitCardDeliveredAction
{
    public function handle(Permit $permit): Permit
    {
        if ($permit->card_delivered_at === null) {
            $permit->forceFill(['card_delivered_at' => now()])->save();
        }

        return $permit->refresh();
    }
}
