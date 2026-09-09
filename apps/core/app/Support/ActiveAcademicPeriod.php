<?php

namespace App\Support;

use App\Models\AcademicPeriod;

class ActiveAcademicPeriod
{
    public function __construct(private readonly ApplicationCache $cache) {}

    public function get(): ?AcademicPeriod
    {
        $activeAcademicPeriodId = $this->cache->remember(
            ApplicationCache::ActiveAcademicPeriod,
            'id',
            300,
            fn (): ?int => AcademicPeriod::query()
                ->where('is_active', true)
                ->value('id'),
        );

        if (! is_int($activeAcademicPeriodId)) {
            return null;
        }

        return AcademicPeriod::query()->find($activeAcademicPeriodId);
    }
}
