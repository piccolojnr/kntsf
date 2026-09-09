<?php

namespace App\Support;

use App\Models\Payment;
use Illuminate\Support\Str;

class PaymentReferenceGenerator
{
    public function generate(): string
    {
        do {
            $reference = 'PAY-'.now()->format('Y').'-'.Str::upper(Str::random(6));
        } while (Payment::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
