<?php

namespace App\Actions\Events;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Event;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use App\Support\SlugGenerator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class CreateEventAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $organizer, array $attributes): Event
    {
        return DB::transaction(function () use ($organizer, $attributes): Event {
            $status = PublishStatus::tryFrom((string) ($attributes['status'] ?? PublishStatus::Draft->value))
                ?? PublishStatus::Draft;
            $publishedAt = $attributes['published_at'] ?? null;

            if ($status === PublishStatus::Published && blank($publishedAt)) {
                $publishedAt = now();
            }

            $event = Event::query()->create([
                'organizer_id' => $organizer->id,
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? $this->slugGenerator->generate($attributes['title'], Event::class),
                'description' => $attributes['description'],
                'excerpt' => $attributes['excerpt'] ?? null,
                'location' => $attributes['location'] ?? null,
                'category' => $attributes['category'] ?? null,
                'status' => $status,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? Visibility::Public->value)) ?? Visibility::Public,
                'is_featured' => (bool) ($attributes['is_featured'] ?? false),
                'starts_at' => $attributes['starts_at'],
                'ends_at' => $attributes['ends_at'] ?? null,
                'max_attendees' => $attributes['max_attendees'] ?? null,
                'current_attendees' => 0,
                'published_at' => $publishedAt,
                'metadata' => [],
            ]);

            $this->syncMedia($event, $attributes);

            $this->createAuditLog->handle(
                actor: $organizer,
                event: AuditEvents::EventCreated,
                auditable: $event,
                subject: $event,
                description: 'Event created.',
                newValues: $event->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'starts_at', 'ends_at']),
            );

            return $event->load('organizer');
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function syncMedia(Event $event, array $attributes): void
    {
        if (($attributes['banner'] ?? null) instanceof UploadedFile) {
            $event
                ->addMedia($attributes['banner'])
                ->toMediaCollection(MediaCollections::BANNER);
        }

        foreach (($attributes['gallery'] ?? []) as $galleryImage) {
            if ($galleryImage instanceof UploadedFile) {
                $event
                    ->addMedia($galleryImage)
                    ->toMediaCollection(MediaCollections::GALLERY);
            }
        }
    }
}
