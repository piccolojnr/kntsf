<?php

namespace App\Policies;

use App\Models\AcademicPeriod;
use App\Models\User;

class AcademicPeriodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('academic_periods.view');
    }

    public function view(User $user, AcademicPeriod $academicPeriod): bool
    {
        return $user->can('academic_periods.view');
    }

    public function create(User $user): bool
    {
        return $user->can('academic_periods.manage');
    }

    public function update(User $user, AcademicPeriod $academicPeriod): bool
    {
        return $user->can('academic_periods.manage');
    }

    public function delete(User $user, AcademicPeriod $academicPeriod): bool
    {
        return $user->can('academic_periods.manage');
    }

    public function restore(User $user, AcademicPeriod $academicPeriod): bool
    {
        return $user->can('academic_periods.manage');
    }

    public function forceDelete(User $user, AcademicPeriod $academicPeriod): bool
    {
        return $user->can('academic_periods.manage');
    }

    public function setActive(User $user, AcademicPeriod $academicPeriod): bool
    {
        return $user->can('academic_periods.manage');
    }
}
