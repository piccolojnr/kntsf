<?php

namespace App\Actions\Polls;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PollOptionStatus;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\User;
use App\Support\AuditEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MergePollOptionAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Poll $poll, PollOption $sourceOption, PollOption $targetOption, User $actor): PollOption
    {
        return DB::transaction(function () use ($poll, $sourceOption, $targetOption, $actor): PollOption {
            if ($sourceOption->poll_id !== $poll->id || $targetOption->poll_id !== $poll->id) {
                throw ValidationException::withMessages([
                    'target_option_id' => 'Both options must belong to the same poll.',
                ]);
            }

            if ($sourceOption->is($targetOption)) {
                throw ValidationException::withMessages([
                    'target_option_id' => 'Choose a different target option.',
                ]);
            }

            $sourceOption = PollOption::query()->lockForUpdate()->findOrFail($sourceOption->id);
            $targetOption = PollOption::query()->lockForUpdate()->findOrFail($targetOption->id);

            foreach ($sourceOption->votes()->get() as $vote) {
                $alreadyVotedTarget = $poll->votes()
                    ->where('student_id', $vote->student_id)
                    ->where('poll_option_id', $targetOption->id)
                    ->exists();

                if ($alreadyVotedTarget) {
                    $vote->delete();

                    continue;
                }

                $vote->update([
                    'poll_option_id' => $targetOption->id,
                ]);
            }

            $sourceOption->update([
                'status' => PollOptionStatus::Merged,
                'merged_into_id' => $targetOption->id,
            ]);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::PollOptionMerged,
                auditable: $poll,
                subject: $sourceOption,
                description: 'Poll option merged.',
                metadata: [
                    'target_option_id' => $targetOption->id,
                ],
            );

            return $sourceOption->refresh();
        });
    }
}
