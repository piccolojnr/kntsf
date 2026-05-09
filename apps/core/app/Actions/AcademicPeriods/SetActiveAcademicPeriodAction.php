<?php

namespace App\Actions\AcademicPeriods;

use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\DB;

class SetActiveAcademicPeriodAction
{
    public function handle(AcademicPeriod $academicPeriod): AcademicPeriod
    {
        return DB::transaction(function () use ($academicPeriod): AcademicPeriod {
            AcademicPeriod::query()
                ->whereKeyNot($academicPeriod->getKey())
                ->where('is_active', true)
                ->update(['is_active' => false]);

            $academicPeriod->forceFill(['is_active' => true])->save();

            return $academicPeriod->refresh();
        });
    }
}
