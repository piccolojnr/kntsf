<?php

namespace App\Policies;

use App\Models\ExecutiveProfile;
use App\Models\User;

class ExecutiveProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('executives.view');
    }

    public function view(User $user, ExecutiveProfile $executiveProfile): bool
    {
        return $user->can('executives.view');
    }

    public function create(User $user): bool
    {
        return $user->can('executives.manage_profiles');
    }

    public function update(User $user, ExecutiveProfile $executiveProfile): bool
    {
        return $user->can('executives.manage_profiles')
            && (! $executiveProfile->user?->hasRole('super_admin') || $user->hasRole('super_admin'));
    }

    public function delete(User $user, ExecutiveProfile $executiveProfile): bool
    {
        return false;
    }
}
