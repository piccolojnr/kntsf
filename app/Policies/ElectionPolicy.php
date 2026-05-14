<?php

namespace App\Policies;

use App\Models\Election;
use App\Models\User;

class ElectionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('elections.view');
    }

    public function view(User $user, Election $election): bool
    {
        return $user->can('elections.view');
    }

    public function create(User $user): bool
    {
        return $user->can('elections.create');
    }

    public function update(User $user, Election $election): bool
    {
        return $user->can('elections.update');
    }

    public function delete(User $user, Election $election): bool
    {
        return $user->can('elections.delete');
    }

    public function restore(User $user, Election $election): bool
    {
        return $user->can('elections.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Election $election): bool
    {
        return false;
    }

    public function publish(User $user, Election $election): bool
    {
        return $user->can('elections.publish');
    }

    public function manageCandidates(User $user, Election $election): bool
    {
        return $user->can('elections.manage_candidates');
    }

    public function vote(User $user, Election $election): bool
    {
        return $user->can('elections.vote') && $user->student()->exists();
    }

    public function viewResults(User $user, Election $election): bool
    {
        return $election->results_visible || $user->can('elections.view_results');
    }
}
