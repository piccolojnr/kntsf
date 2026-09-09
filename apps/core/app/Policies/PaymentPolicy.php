<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('payments.view');
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->can('payments.view');
    }

    public function create(User $user): bool
    {
        return $user->can('payments.manage');
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->can('payments.manage');
    }

    public function markSuccessful(User $user, Payment $payment): bool
    {
        return $user->can('payments.manage');
    }

    public function markFailed(User $user, Payment $payment): bool
    {
        return $user->can('payments.manage');
    }

    public function cancel(User $user, Payment $payment): bool
    {
        return $user->can('payments.manage');
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->can('payments.manage');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Payment $payment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Payment $payment): bool
    {
        return false;
    }
}
