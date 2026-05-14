<?php

namespace App\Actions\Documents;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Models\Document;
use App\Models\User;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use Illuminate\Validation\ValidationException;

class PublishDocumentAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Document $document, User $actor, mixed $publishedAt = null): Document
    {
        if (! $document->hasMedia(MediaCollections::FILES)) {
            throw ValidationException::withMessages([
                'files' => 'Attach at least one document file before publishing.',
            ]);
        }

        $oldValues = $document->only(['status', 'published_at']);

        $document->update([
            'status' => PublishStatus::Published,
            'published_at' => $publishedAt ?: now(),
            'archived_at' => null,
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::DocumentPublished,
            auditable: $document,
            subject: $document,
            description: 'Document published.',
            oldValues: $oldValues,
            newValues: $document->only(['status', 'published_at']),
        );

        return $document->refresh()->load('author');
    }
}
