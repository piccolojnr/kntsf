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

class UpdateEventAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Event $event, User $actor, array $attributes): Event
    {
        return DB::transaction(function () use ($event, $actor, $attributes): Event {
            $oldValues = $event->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'starts_at', 'ends_at']);
            $status = PublishStatus::tryFrom((string) ($attributes['status'] ?? $event->status->value))
                ?? $event->status;
            $publishedAt = $attributes['published_at'] ?? $event->published_at;

            if ($status === PublishStatus::Published && blank($publishedAt)) {
                $publishedAt = now();
            }

            $titleChanged = $attributes['title'] !== $event->title;

            $event->update([
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? ($titleChanged
                    ? $this->slugGenerator->generate($attributes['title'], Event::class, ignoreId: $event->id)
                    : $event->slug),
                'description' => $attributes['description'],
                'excerpt' => $attributes['excerpt'] ?? null,
                'location' => $attributes['location'] ?? null,
                'category' => $attributes['category'] ?? null,
                'status' => $status,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? $event->visibility->value)) ?? $event->visibility,
                'is_featured' => (bool) ($attributes['is_featured'] ?? false),
                'starts_at' => $attributes['starts_at'],
                'ends_at' => $attributes['ends_at'] ?? null,
                'max_attendees' => $attributes['max_attendees'] ?? null,
                'published_at' => $publishedAt,
            ]);

            $this->syncMedia($event, $attributes);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::EventUpdated,
                auditable: $event,
                subject: $event,
                description: 'Event updated.',
                oldValues: $oldValues,
                newValues: $event->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'starts_at', 'ends_at']),
            );

            return $event->refresh()->load('organizer');
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
