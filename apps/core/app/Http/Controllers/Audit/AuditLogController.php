<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\AuditEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        Gate::authorize('viewAny', AuditLog::class);

        $event = $request->string('event')->trim()->toString();
        $actor = $request->string('actor')->trim()->toString();
        $dateFrom = $request->date('date_from')?->startOfDay();
        $dateTo = $request->date('date_to')?->endOfDay();
        $subjectType = $request->string('subject_type')->trim()->toString();

        $logs = AuditLog::query()
            ->with(['actor:id,name,email', 'subject'])
            ->when($event !== '', fn (Builder $query) => $query->where('event', $event))
            ->when($actor !== '', function (Builder $query) use ($actor) {
                $query->whereHas('actor', function (Builder $query) use ($actor) {
                    $query->where('name', 'like', "%{$actor}%")
                        ->orWhere('email', 'like', "%{$actor}%");
                });
            })
            ->when($dateFrom !== null, fn (Builder $query) => $query->where('created_at', '>=', $dateFrom))
            ->when($dateTo !== null, fn (Builder $query) => $query->where('created_at', '<=', $dateTo))
            ->when($subjectType !== '', fn (Builder $query) => $query->where('subject_type', 'like', "%{$subjectType}%"))
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (AuditLog $log): array => $this->payload($log));

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
            'filters' => [
                'event' => $event,
                'actor' => $actor,
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
                'subject_type' => $subjectType,
            ],
            'events' => AuditEvents::all(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(AuditLog $log): array
    {
        return [
            'id' => $log->id,
            'event' => $log->event,
            'event_label' => str($log->event)->replace('.', ' ')->title()->toString(),
            'description' => $log->description,
            'actor' => $log->actor === null ? null : [
                'id' => $log->actor->id,
                'name' => $log->actor->name,
                'email' => $log->actor->email,
            ],
            'auditable' => $this->morphPayload($log->auditable_type, $log->auditable_id),
            'subject' => $this->morphPayload($log->subject_type, $log->subject_id),
            'metadata' => $log->metadata,
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'created_at' => $log->created_at?->toISOString(),
        ];
    }

    /**
     * @return array{type: string, id: int|string|null, label: string}|null
     */
    private function morphPayload(?string $type, int|string|null $id): ?array
    {
        if ($type === null) {
            return null;
        }

        return [
            'type' => class_basename($type),
            'id' => $id,
            'label' => class_basename($type).' #'.$id,
        ];
    }
}
