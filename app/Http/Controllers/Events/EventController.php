<?php

namespace App\Http\Controllers\Events;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Events\ArchiveEventAction;
use App\Actions\Events\CreateEventAction;
use App\Actions\Events\PublishEventAction;
use App\Actions\Events\UpdateEventAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Events\PublishEventRequest;
use App\Http\Requests\Events\StoreEventRequest;
use App\Http\Requests\Events\UpdateEventRequest;
use App\Models\Event;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Event::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $events = Event::query()
            ->with('organizer:id,name,email')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->latest('starts_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Event $event): array => $this->payload($event));

        return Inertia::render('events/index', [
            'events' => $events,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'overview' => [
                'total' => Event::query()->count(),
                'draft' => Event::query()->where('status', 'draft')->count(),
                'published' => Event::query()->where('status', 'published')->count(),
                'upcoming' => Event::query()
                    ->where('status', 'published')
                    ->where('starts_at', '>=', now())
                    ->count(),
            ],
            'can' => [
                'create' => $request->user()?->can('create', Event::class) ?? false,
                'update' => $request->user()?->can('events.update') ?? false,
                'publish' => $request->user()?->can('events.publish') ?? false,
                'delete' => $request->user()?->can('events.delete') ?? false,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Event::class);

        return Inertia::render('events/create', [
            'defaults' => $this->defaults(),
        ]);
    }

    public function store(StoreEventRequest $request, CreateEventAction $createEvent): RedirectResponse
    {
        $event = $createEvent->handle($request->user(), $request->validated());

        return to_route('events.show', $event);
    }

    public function show(Request $request, Event $event): Response
    {
        Gate::authorize('view', $event);

        return Inertia::render('events/show', [
            'event' => $this->payload($event->load('organizer:id,name,email')),
            'can' => [
                'update' => $request->user()?->can('update', $event) ?? false,
                'publish' => $request->user()?->can('publish', $event) ?? false,
                'archive' => $request->user()?->can('archive', $event) ?? false,
                'delete' => $request->user()?->can('delete', $event) ?? false,
            ],
        ]);
    }

    public function edit(Event $event): Response
    {
        Gate::authorize('update', $event);

        return Inertia::render('events/edit', [
            'event' => $this->payload($event->load('organizer:id,name,email')),
            'defaults' => $this->defaults(),
        ]);
    }

    public function update(
        UpdateEventRequest $request,
        Event $event,
        UpdateEventAction $updateEvent
    ): RedirectResponse {
        $updateEvent->handle($event, $request->user(), $request->validated());

        return to_route('events.show', $event);
    }

    public function publish(
        PublishEventRequest $request,
        Event $event,
        PublishEventAction $publishEvent
    ): RedirectResponse {
        $publishEvent->handle($event, $request->user(), $request->validated('published_at'));

        return back();
    }

    public function archive(Request $request, Event $event, ArchiveEventAction $archiveEvent): RedirectResponse
    {
        Gate::authorize('archive', $event);

        $archiveEvent->handle($event, $request->user());

        return back();
    }

    public function destroy(Request $request, Event $event, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('delete', $event);

        $oldValues = $event->only(['title', 'slug', 'status', 'visibility']);

        $event->delete();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::EventDeleted,
            auditable: $event,
            subject: $event,
            description: 'Event deleted.',
            oldValues: $oldValues,
            request: $request,
        );

        return to_route('events.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'slug' => $event->slug,
            'description' => $event->description,
            'excerpt' => $event->excerpt,
            'location' => $event->location,
            'category' => $event->category,
            'status' => $event->status->value,
            'visibility' => $event->visibility->value,
            'is_featured' => $event->is_featured,
            'starts_at' => $event->starts_at?->toISOString(),
            'ends_at' => $event->ends_at?->toISOString(),
            'max_attendees' => $event->max_attendees,
            'current_attendees' => $event->current_attendees,
            'published_at' => $event->published_at?->toISOString(),
            'archived_at' => $event->archived_at?->toISOString(),
            'created_at' => $event->created_at?->toISOString(),
            'updated_at' => $event->updated_at?->toISOString(),
            'banner_url' => $event->getFirstMediaUrl(MediaCollections::BANNER) ?: null,
            'organizer' => [
                'id' => $event->organizer->id,
                'name' => $event->organizer->name,
                'email' => $event->organizer->email,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaults(): array
    {
        return [
            'status' => 'draft',
            'visibility' => 'public',
            'is_featured' => false,
        ];
    }
}
