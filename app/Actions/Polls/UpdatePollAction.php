<?php

namespace App\Actions\Polls;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Poll;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\DB;

class UpdatePollAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Poll $poll, User $actor, array $attributes): Poll
    {
        return DB::transaction(function () use ($poll, $actor, $attributes): Poll {
            $oldValues = $poll->only(['title', 'slug', 'type', 'status', 'visibility']);
            $titleChanged = $attributes['title'] !== $poll->title;

            $poll->update([
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? ($titleChanged
                    ? $this->slugGenerator->generate($attributes['title'], Poll::class, ignoreId: $poll->id)
                    : $poll->slug),
                'description' => $attributes['description'] ?? null,
                'type' => PollType::tryFrom((string) ($attributes['type'] ?? $poll->type->value)) ?? $poll->type,
                'status' => PublishStatus::tryFrom((string) ($attributes['status'] ?? $poll->status->value)) ?? $poll->status,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? $poll->visibility->value)) ?? $poll->visibility,
                'starts_at' => $attributes['starts_at'] ?? null,
                'ends_at' => $attributes['ends_at'] ?? null,
                'show_results' => (bool) ($attributes['show_results'] ?? false),
                'allow_vote_change' => (bool) ($attributes['allow_vote_change'] ?? false),
            ]);

            $this->syncOptions($poll, $attributes['options'] ?? []);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::PollUpdated,
                auditable: $poll,
                subject: $poll,
                description: 'Poll updated.',
                oldValues: $oldValues,
                newValues: $poll->only(['title', 'slug', 'type', 'status', 'visibility']),
            );

            return $poll->refresh()->load('creator', 'options');
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $options
     */
    private function syncOptions(Poll $poll, array $options): void
    {
        foreach (array_values($options) as $index => $option) {
            $text = trim((string) ($option['text'] ?? ''));

            if ($text === '') {
                continue;
            }

            if (! empty($option['id'])) {
                $poll->options()->whereKey($option['id'])->update([
                    'text' => $text,
                    'sort_order' => $index,
                ]);

                continue;
            }

            $poll->options()->create([
                'text' => $text,
                'sort_order' => $index,
            ]);
        }
    }
}
