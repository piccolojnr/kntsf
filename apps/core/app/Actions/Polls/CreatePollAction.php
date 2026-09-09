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

class CreatePollAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $creator, array $attributes): Poll
    {
        return DB::transaction(function () use ($creator, $attributes): Poll {
            $poll = Poll::query()->create([
                'created_by_id' => $creator->id,
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? $this->slugGenerator->generate($attributes['title'], Poll::class),
                'description' => $attributes['description'] ?? null,
                'type' => PollType::tryFrom((string) ($attributes['type'] ?? PollType::FixedOptions->value)) ?? PollType::FixedOptions,
                'status' => PublishStatus::tryFrom((string) ($attributes['status'] ?? PublishStatus::Draft->value)) ?? PublishStatus::Draft,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? Visibility::Internal->value)) ?? Visibility::Internal,
                'starts_at' => $attributes['starts_at'] ?? null,
                'ends_at' => $attributes['ends_at'] ?? null,
                'show_results' => (bool) ($attributes['show_results'] ?? true),
                'allow_vote_change' => (bool) ($attributes['allow_vote_change'] ?? false),
                'metadata' => [],
            ]);

            $this->syncOptions($poll, $attributes['options'] ?? []);

            $this->createAuditLog->handle(
                actor: $creator,
                event: AuditEvents::PollCreated,
                auditable: $poll,
                subject: $poll,
                description: 'Poll created.',
                newValues: $poll->only(['title', 'slug', 'type', 'status', 'visibility']),
            );

            return $poll->load('creator', 'options');
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

            $poll->options()->create([
                'text' => $text,
                'sort_order' => $index,
            ]);
        }
    }
}
