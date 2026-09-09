<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('executives.view');
    }

    public function view(User $user, User $executive): bool
    {
        return $user->can('executives.view') && $this->canManageTarget($user, $executive, allowSelf: true);
    }

    public function create(User $user): bool
    {
        return $user->can('executives.create');
    }

    public function update(User $user, User $executive): bool
    {
        return $user->can('executives.update') && $this->canManageTarget($user, $executive, allowSelf: true);
    }

    public function delete(User $user, User $executive): bool
    {
        return $user->can('executives.delete') && $this->canManageTarget($user, $executive);
    }

    public function activate(User $user, User $executive): bool
    {
        return $user->can('executives.activate') && $this->canManageTarget($user, $executive);
    }

    public function deactivate(User $user, User $executive): bool
    {
        return $user->can('executives.activate') && $this->canManageTarget($user, $executive);
    }

    public function sendSetupLink(User $user, User $executive): bool
    {
        return $user->can('executives.update') && $this->canManageTarget($user, $executive, allowSelf: true);
    }

    public function manageProfiles(User $user, User $executive): bool
    {
        return $user->can('executives.manage_profiles') && $this->canManageTarget($user, $executive, allowSelf: true);
    }

    private function canManageTarget(User $user, User $executive, bool $allowSelf = false): bool
    {
        if (! $allowSelf && $user->is($executive)) {
            return false;
        }

        if ($executive->hasRole('super_admin') && ! $user->hasRole('super_admin')) {
            return false;
        }

        return true;
    }
}
