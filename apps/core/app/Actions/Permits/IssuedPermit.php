<?php

namespace App\Actions\Permits;

use App\Models\Permit;

final readonly class IssuedPermit
{
    public function __construct(
        public Permit $permit,
        public string $code,
    ) {}
}
