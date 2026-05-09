<?php

namespace App\Actions\Permits;

use Illuminate\Support\Str;

class GeneratePermitCodeAction
{
    public function handle(): string
    {
        return 'KNT-'.Str::upper(Str::random(4)).'-'.Str::upper(Str::random(4)).'-'.random_int(1000, 9999);
    }
}
