<?php

namespace App\Actions\Polls;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Models\Poll;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Validation\ValidationException;

class PublishPollAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Poll $poll, User $actor): Poll
    {
        if ($poll->type === PollType::FixedOptions && $poll->activeOptions()->count() < 2) {
            throw ValidationException::withMessages([
                'options' => 'Fixed option polls need at least two active options before publishing.',
            ]);
        }

        $oldValues = $poll->only(['status']);

        $poll->update([
            'status' => PublishStatus::Published,
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::PollPublished,
            auditable: $poll,
            subject: $poll,
            description: 'Poll published.',
            oldValues: $oldValues,
            newValues: $poll->only(['status']),
        );

        return $poll->refresh()->load('creator', 'options');
    }
}
