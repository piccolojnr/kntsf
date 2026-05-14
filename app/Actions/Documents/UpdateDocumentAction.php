<?php

namespace App\Actions\Documents;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Document;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use App\Support\SlugGenerator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateDocumentAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Document $document, User $actor, array $attributes): Document
    {
        return DB::transaction(function () use ($document, $actor, $attributes): Document {
            $oldValues = $document->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'published_at']);
            $status = PublishStatus::tryFrom((string) ($attributes['status'] ?? $document->status->value))
                ?? $document->status;
            $publishedAt = $attributes['published_at'] ?? $document->published_at;

            if ($status === PublishStatus::Published && blank($publishedAt)) {
                $publishedAt = now();
            }

            $titleChanged = $attributes['title'] !== $document->title;

            $document->update([
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? ($titleChanged
                    ? $this->slugGenerator->generate($attributes['title'], Document::class, ignoreId: $document->id)
                    : $document->slug),
                'excerpt' => $attributes['excerpt'] ?? null,
                'description' => $attributes['description'] ?? null,
                'category' => $attributes['category'] ?? null,
                'status' => $status,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? $document->visibility->value)) ?? $document->visibility,
                'is_featured' => (bool) ($attributes['is_featured'] ?? false),
                'published_at' => $publishedAt,
            ]);

            $this->syncMedia($document, $attributes);
            $this->ensurePublishable($document, $status);

            $this->createAuditLog->handle(
                actor: $actor,
                event: AuditEvents::DocumentUpdated,
                auditable: $document,
                subject: $document,
                description: 'Document updated.',
                oldValues: $oldValues,
                newValues: $document->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'published_at']),
            );

            return $document->refresh()->load('author');
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function syncMedia(Document $document, array $attributes): void
    {
        foreach (($attributes['files'] ?? []) as $file) {
            if ($file instanceof UploadedFile) {
                $document
                    ->addMedia($file)
                    ->toMediaCollection(MediaCollections::FILES);
            }
        }

        if (($attributes['featured_image'] ?? null) instanceof UploadedFile) {
            $document
                ->addMedia($attributes['featured_image'])
                ->toMediaCollection(MediaCollections::FEATURED_IMAGE);
        }
    }

    private function ensurePublishable(Document $document, PublishStatus $status): void
    {
        if ($status === PublishStatus::Published && ! $document->hasMedia(MediaCollections::FILES)) {
            throw ValidationException::withMessages([
                'files' => 'Attach at least one document file before publishing.',
            ]);
        }
    }
}
