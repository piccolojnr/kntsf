<?php

namespace App\Support;

use App\Models\PermitRequest;
use Illuminate\Support\Str;

class PermitRequestReferenceGenerator
{
    public function generate(): string
    {
        do {
            $reference = 'PR-'.now()->format('Y').'-'.Str::upper(Str::random(8));
        } while (PermitRequest::query()->where('request_reference', $reference)->exists());

        return $reference;
    }
}
