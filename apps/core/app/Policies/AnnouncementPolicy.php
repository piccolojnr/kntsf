<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

class AnnouncementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('announcements.view');
    }

    public function view(User $user, Announcement $announcement): bool
    {
        return $user->can('announcements.view');
    }

    public function create(User $user): bool
    {
        return $user->can('announcements.create');
    }

    public function update(User $user, Announcement $announcement): bool
    {
        return $user->can('announcements.update');
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        return $user->can('announcements.delete');
    }

    public function restore(User $user, Announcement $announcement): bool
    {
        return $user->can('announcements.delete');
    }

    public function forceDelete(User $user, Announcement $announcement): bool
    {
        return false;
    }

    public function publish(User $user, Announcement $announcement): bool
    {
        return $user->can('announcements.publish');
    }

    public function archive(User $user, Announcement $announcement): bool
    {
        return $user->can('announcements.publish');
    }
}
