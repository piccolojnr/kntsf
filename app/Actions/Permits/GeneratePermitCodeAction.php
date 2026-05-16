<?php

namespace App\Actions\Permits;

use Illuminate\Support\Str;

class GeneratePermitCodeAction
{
    public function handle(): string
    {
        return 'KUC-' . Str::substr(now()->format('Y'), -2) . '-' . random_int(1000, 9999); // Example: KUC-24-1234
    }
}
