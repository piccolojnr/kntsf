<?php

namespace App\Support;

use App\Models\AcademicPeriod;

class ActiveAcademicPeriod
{
    public function __construct(private readonly ApplicationCache $cache) {}

    public function get(): ?AcademicPeriod
    {
        return $this->cache->remember(
            ApplicationCache::ActiveAcademicPeriod,
            'default',
            300,
            fn (): ?AcademicPeriod => AcademicPeriod::query()
                ->where('is_active', true)
                ->first(),
        );
    }
}
