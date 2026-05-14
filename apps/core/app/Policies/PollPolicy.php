<?php

namespace App\Policies;

use App\Models\Poll;
use App\Models\User;

class PollPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('polls.view');
    }

    public function view(User $user, Poll $poll): bool
    {
        return $user->can('polls.view');
    }

    public function create(User $user): bool
    {
        return $user->can('polls.create');
    }

    public function update(User $user, Poll $poll): bool
    {
        return $user->can('polls.update');
    }

    public function delete(User $user, Poll $poll): bool
    {
        return $user->can('polls.delete');
    }

    public function restore(User $user, Poll $poll): bool
    {
        return $user->can('polls.delete');
    }

    public function forceDelete(User $user, Poll $poll): bool
    {
        return false;
    }

    public function publish(User $user, Poll $poll): bool
    {
        return $user->can('polls.publish');
    }

    public function archive(User $user, Poll $poll): bool
    {
        return $user->can('polls.publish');
    }

    public function vote(User $user, Poll $poll): bool
    {
        return $user->can('polls.vote') && $user->student()->exists();
    }

    public function viewResults(User $user, Poll $poll): bool
    {
        return $poll->show_results || $user->can('polls.view_results');
    }

    public function mergeOption(User $user, Poll $poll): bool
    {
        return $user->can('polls.update');
    }
}
