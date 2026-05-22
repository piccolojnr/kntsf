<?php

namespace App\Policies;

use App\Models\PermitRequest;
use App\Models\User;

class PermitRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('permit_requests.view');
    }

    public function view(User $user, PermitRequest $permitRequest): bool
    {
        return $user->can('permit_requests.view');
    }

    public function create(User $user): bool
    {
        return $user->can('permit_requests.manage');
    }

    public function update(User $user, PermitRequest $permitRequest): bool
    {
        return $user->can('permit_requests.manage');
    }

    public function review(User $user, PermitRequest $permitRequest): bool
    {
        return $user->can('permit_requests.manage');
    }

    public function delete(User $user, PermitRequest $permitRequest): bool
    {
        return false;
    }

    public function restore(User $user, PermitRequest $permitRequest): bool
    {
        return false;
    }

    public function forceDelete(User $user, PermitRequest $permitRequest): bool
    {
        return false;
    }
}
