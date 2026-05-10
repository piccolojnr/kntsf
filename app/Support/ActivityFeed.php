<?php

namespace App\Support;

use App\Models\AuditLog;

class ActivityFeed
{
    /**
     * @return array<int, array{id: int, event: string, label: string, description: string|null, actor: array{id: int, name: string, email: string}|null, subject: array{type: string, id: int|string|null, label: string}|null, created_at: string|null, metadata: array<string, mixed>|null}>
     */
    public function items(int $limit = 10): array
    {
        return AuditLog::query()
            ->with(['actor:id,name,email', 'subject'])
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'event' => $log->event,
                'label' => str($log->event)->replace('.', ' ')->title()->toString(),
                'description' => $log->description,
                'actor' => $log->actor === null ? null : [
                    'id' => $log->actor->id,
                    'name' => $log->actor->name,
                    'email' => $log->actor->email,
                ],
                'subject' => $this->subjectPayload($log),
                'created_at' => $log->created_at?->toISOString(),
                'metadata' => $log->metadata,
            ])
            ->all();
    }

    /**
     * @return array{type: string, id: int|string|null, label: string}|null
     */
    private function subjectPayload(AuditLog $log): ?array
    {
        if ($log->subject_type === null) {
            return null;
        }

        return [
            'type' => class_basename($log->subject_type),
            'id' => $log->subject_id,
            'label' => class_basename($log->subject_type).' #'.$log->subject_id,
        ];
    }
}
