<?php

namespace App\Policies;

use App\Models\Permit;
use App\Models\User;

class PermitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('permits.view');
    }

    public function view(User $user, Permit $permit): bool
    {
        return $user->can('permits.view');
    }

    public function create(User $user): bool
    {
        return $user->can('permits.issue');
    }

    public function revoke(User $user, Permit $permit): bool
    {
        return $user->can('permits.revoke');
    }

    public function markCardDelivered(User $user, Permit $permit): bool
    {
        return $user->can('permits.issue');
    }

    public function delete(User $user, Permit $permit): bool
    {
        return $user->can('permits.revoke');
    }

    public function restore(User $user, Permit $permit): bool
    {
        return $user->can('permits.revoke');
    }
}
