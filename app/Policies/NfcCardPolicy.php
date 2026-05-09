<?php

namespace App\Policies;

use App\Models\NfcCard;
use App\Models\User;

class NfcCardPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('nfc_cards.view');
    }

    public function view(User $user, NfcCard $nfcCard): bool
    {
        return $user->can('nfc_cards.view');
    }

    public function create(User $user): bool
    {
        return $user->can('nfc_cards.manage');
    }

    public function update(User $user, NfcCard $nfcCard): bool
    {
        return $user->can('nfc_cards.manage');
    }

    public function revoke(User $user, NfcCard $nfcCard): bool
    {
        return $user->can('nfc_cards.manage');
    }

    public function replace(User $user, NfcCard $nfcCard): bool
    {
        return $user->can('nfc_cards.manage');
    }

    public function markLost(User $user, NfcCard $nfcCard): bool
    {
        return $user->can('nfc_cards.manage');
    }

    public function delete(User $user, NfcCard $nfcCard): bool
    {
        return $user->can('nfc_cards.manage');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, NfcCard $nfcCard): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, NfcCard $nfcCard): bool
    {
        return false;
    }
}
