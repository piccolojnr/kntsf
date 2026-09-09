<?php

namespace App\Support;

use App\Models\AcademicPeriod;
use Illuminate\Database\Eloquent\Builder;

class ActiveAcademicPeriod
{
    public function __construct(private readonly ApplicationCache $cache) {}

    public function get(): ?AcademicPeriod
    {
        $activeAcademicPeriodId = $this->cache->remember(
            ApplicationCache::ActiveAcademicPeriod,
            'id',
            300,
            function (): ?int {
                $today = now()->toDateString();
                $withinCurrentDate = fn (Builder $query): Builder => $query
                    ->where(fn (Builder $query): Builder => $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today))
                    ->where(fn (Builder $query): Builder => $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today));

                $activeCurrentPeriodId = AcademicPeriod::query()
                    ->where('is_active', true)
                    ->where($withinCurrentDate)
                    ->value('id');

                if (is_int($activeCurrentPeriodId)) {
                    return $activeCurrentPeriodId;
                }

                $currentPeriodId = AcademicPeriod::query()
                    ->where(fn (Builder $query): Builder => $query->whereNotNull('starts_at')->orWhereNotNull('ends_at'))
                    ->where($withinCurrentDate)
                    ->latest('starts_at')
                    ->value('id');

                if (is_int($currentPeriodId)) {
                    return $currentPeriodId;
                }

                return AcademicPeriod::query()
                    ->where('is_active', true)
                    ->value('id');
            },
        );

        if (! is_int($activeAcademicPeriodId)) {
            return null;
        }

        return AcademicPeriod::query()->find($activeAcademicPeriodId);
    }
}
