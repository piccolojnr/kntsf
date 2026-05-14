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

class CreateDocumentAction
{
    public function __construct(
        private readonly SlugGenerator $slugGenerator,
        private readonly CreateAuditLogAction $createAuditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $author, array $attributes): Document
    {
        return DB::transaction(function () use ($author, $attributes): Document {
            $status = PublishStatus::tryFrom((string) ($attributes['status'] ?? PublishStatus::Draft->value))
                ?? PublishStatus::Draft;
            $publishedAt = $attributes['published_at'] ?? null;

            if ($status === PublishStatus::Published && blank($publishedAt)) {
                $publishedAt = now();
            }

            $document = Document::query()->create([
                'author_id' => $author->id,
                'title' => $attributes['title'],
                'slug' => $attributes['slug'] ?? $this->slugGenerator->generate($attributes['title'], Document::class),
                'excerpt' => $attributes['excerpt'] ?? null,
                'description' => $attributes['description'] ?? null,
                'category' => $attributes['category'] ?? null,
                'status' => $status,
                'visibility' => Visibility::tryFrom((string) ($attributes['visibility'] ?? Visibility::Public->value)) ?? Visibility::Public,
                'is_featured' => (bool) ($attributes['is_featured'] ?? false),
                'published_at' => $publishedAt,
                'metadata' => [],
            ]);

            $this->syncMedia($document, $attributes);
            $this->ensurePublishable($document, $status);

            $this->createAuditLog->handle(
                actor: $author,
                event: AuditEvents::DocumentCreated,
                auditable: $document,
                subject: $document,
                description: 'Document created.',
                newValues: $document->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'published_at']),
            );

            return $document->load('author');
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
