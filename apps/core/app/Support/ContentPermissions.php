<?php

namespace App\Support;

use App\Models\User;

class ContentPermissions
{
    public function canView(User $user, string $domain): bool
    {
        return $this->can($user, $domain, 'view');
    }

    public function canCreate(User $user, string $domain): bool
    {
        return $this->can($user, $domain, 'create');
    }

    public function canUpdate(User $user, string $domain): bool
    {
        return $this->can($user, $domain, 'update');
    }

    public function canPublish(User $user, string $domain): bool
    {
        return $this->can($user, $domain, 'publish');
    }

    public function canArchive(User $user, string $domain): bool
    {
        return $this->can($user, $domain, 'archive');
    }

    public function canDelete(User $user, string $domain): bool
    {
        return $this->can($user, $domain, 'delete');
    }

    private function can(User $user, string $domain, string $action): bool
    {
        return $user->can("{$domain}.{$action}") || $user->can("{$domain}.manage");
    }
}
