<?php

namespace App\Actions\Announcements;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Announcement;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use App\Support\SlugGenerator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UpdateAnnouncementAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Announcement $announcement, User $actor, array $attributes): Announcement
    {
        return DB::transaction(function () use ($announcement, $actor, $attributes): Announcement {
            $oldValues = $announcement->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'published_at']);
            $status = PublishStatus::tryFrom((string) ($attributes['status'] ?? $announcement->status->value))
                ?? $announcement->status;
            $publishedAt = $attributes['published_at'] ?? $announcement->published_at;

            if ($status === PublishStatus::Published && blank($publishedAt)) {
                $publishedAt = now();
            }

            $titleChanged = $attributes['title'] !== $announcement->title;

            $announcement->update([
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? ($titleChanged
                    ? $this->slugGenerator->generate($attributes['title'], Announcement::class, ignoreId: $announcement->id)
                    : $announcement->slug),
                'excerpt' => $attributes['excerpt'] ?? null,
                'content' => $attributes['content'],
                'category' => $attributes['category'] ?? null,
                'status' => $status,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? $announcement->visibility->value)) ?? $announcement->visibility,
                'is_featured' => (bool) ($attributes['is_featured'] ?? false),
                'published_at' => $publishedAt,
            ]);

            $this->syncMedia($announcement, $attributes);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::AnnouncementUpdated,
                auditable: $announcement,
                subject: $announcement,
                description: 'Announcement updated.',
                oldValues: $oldValues,
                newValues: $announcement->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'published_at']),
            );

            return $announcement->refresh()->load('author');
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function syncMedia(Announcement $announcement, array $attributes): void
    {
        if (($attributes['featured_image'] ?? null) instanceof UploadedFile) {
            $announcement
                ->addMedia($attributes['featured_image'])
                ->toMediaCollection(MediaCollections::FEATURED_IMAGE);
        }

        foreach (($attributes['gallery'] ?? []) as $galleryImage) {
            if ($galleryImage instanceof UploadedFile) {
                $announcement
                    ->addMedia($galleryImage)
                    ->toMediaCollection(MediaCollections::GALLERY);
            }
        }
    }
}
