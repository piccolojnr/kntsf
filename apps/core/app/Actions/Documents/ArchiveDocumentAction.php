<?php

namespace App\Actions\Documents;

use App\Actions\Audit\CreateAuditLogAction;
use App\Enums\PublishStatus;
use App\Models\Document;
use App\Models\User;
use App\Support\AuditEvents;

class ArchiveDocumentAction
{
    public function __construct(private readonly CreateAuditLogAction $createAuditLog) {}

    public function handle(Document $document, User $actor): Document
    {
        $oldValues = $document->only(['status', 'archived_at']);

        $document->update([
            'status' => PublishStatus::Archived,
            'archived_at' => now(),
        ]);

        $this->createAuditLog->handle(
            actor: $actor,
            event: AuditEvents::DocumentArchived,
            auditable: $document,
            subject: $document,
            description: 'Document archived.',
            oldValues: $oldValues,
            newValues: $document->only(['status', 'archived_at']),
        );

        return $document->refresh()->load('author');
    }
}
