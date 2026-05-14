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

class CreateAnnouncementAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $author, array $attributes): Announcement
    {
        return DB::transaction(function () use ($author, $attributes): Announcement {
            $status = PublishStatus::tryFrom((string) ($attributes['status'] ?? PublishStatus::Draft->value))
                ?? PublishStatus::Draft;
            $publishedAt = $attributes['published_at'] ?? null;

            if ($status === PublishStatus::Published && blank($publishedAt)) {
                $publishedAt = now();
            }

            $announcement = Announcement::query()->create([
                'author_id' => $author->id,
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? $this->slugGenerator->generate($attributes['title'], Announcement::class),
                'excerpt' => $attributes['excerpt'] ?? null,
                'content' => $attributes['content'],
                'category' => $attributes['category'] ?? null,
                'status' => $status,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? Visibility::Public->value)) ?? Visibility::Public,
                'is_featured' => (bool) ($attributes['is_featured'] ?? false),
                'published_at' => $publishedAt,
                'metadata' => [],
            ]);

            $this->syncMedia($announcement, $attributes);

            $this->createAuditLog->handle(
                actor: $author,
                event: AuditEvents::AnnouncementCreated,
                auditable: $announcement,
                subject: $announcement,
                description: 'Announcement created.',
                newValues: $announcement->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'published_at']),
            );

            return $announcement->load('author');
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
