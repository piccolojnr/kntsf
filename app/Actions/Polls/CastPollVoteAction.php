<?php

namespace App\Actions\Polls;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PollOptionStatus;
use App\Enums\PollType;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Student;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CastPollVoteAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Poll $poll, User $actor, array $attributes): PollVote
    {
        return DB::transaction(function () use ($poll, $actor, $attributes): PollVote {
            $poll = Poll::query()->lockForUpdate()->findOrFail($poll->id);
            $student = $actor->student()->lockForUpdate()->first();

            if (! $student instanceof Student) {
                throw ValidationException::withMessages([
                    'student' => 'Only linked student accounts can vote.',
                ]);
            }

            if (! $poll->isOpenForVoting()) {
                throw ValidationException::withMessages([
                    'poll' => 'This poll is not currently open for voting.',
                ]);
            }

            $option = $this->resolveOption($poll, $student, $attributes);
            $existingVote = $poll->votes()->where('student_id', $student->id)->first();

            if ($existingVote instanceof PollVote && ! $poll->allow_vote_change) {
                throw ValidationException::withMessages([
                    'poll_option_id' => 'You have already voted in this poll.',
                ]);
            }

            $vote = PollVote::query()->updateOrCreate(
                [
                    'poll_id' => $poll->id,
                    'student_id' => $student->id,
                ],
                [
                    'poll_option_id' => $option->id,
                ],
            );

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::PollVoteCast,
                auditable: $poll,
                subject: $vote,
                description: 'Poll vote cast.',
                metadata: [
                    'poll_option_id' => $option->id,
                ],
            );

            return $vote->load('poll', 'option', 'student');
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function resolveOption(Poll $poll, Student $student, array $attributes): PollOption
    {
        if (! empty($attributes['poll_option_id'])) {
            $option = $poll->activeOptions()->whereKey($attributes['poll_option_id'])->first();

            if (! $option instanceof PollOption) {
                throw ValidationException::withMessages([
                    'poll_option_id' => 'Choose a valid active poll option.',
                ]);
            }

            return $option;
        }

        if ($poll->type !== PollType::DynamicOptions) {
            throw ValidationException::withMessages([
                'poll_option_id' => 'Choose a poll option.',
            ]);
        }

        $text = trim((string) ($attributes['option_text'] ?? ''));

        if ($text === '') {
            throw ValidationException::withMessages([
                'option_text' => 'Enter an option to vote for.',
            ]);
        }

        return $poll->options()->create([
            'text' => $text,
            'status' => PollOptionStatus::Active,
            'created_by_student_id' => $student->id,
            'sort_order' => $poll->options()->max('sort_order') + 1,
        ]);
    }
}
