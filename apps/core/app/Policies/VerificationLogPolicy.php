<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VerificationLog;

class VerificationLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('verification.view_logs');
    }

    public function view(User $user, VerificationLog $verificationLog): bool
    {
        return $user->can('verification.view_logs');
    }

    public function create(User $user): bool
    {
        return $user->can('verification.perform');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, VerificationLog $verificationLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, VerificationLog $verificationLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, VerificationLog $verificationLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, VerificationLog $verificationLog): bool
    {
        return false;
    }
}
