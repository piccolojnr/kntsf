<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()
            ->published()
            ->publicVisible()
            ->with(['organizer:id,name', 'media'])
            ->orderByRaw('starts_at is null')
            ->orderBy('starts_at')
            ->paginate(9)
            ->through(fn (Event $event): array => self::payload($event));

        return Inertia::render('public/events/index', [
            'events' => $events,
        ]);
    }

    public function show(Event $event): Response
    {
        abort_unless($event->newQuery()->whereKey($event->id)->published()->publicVisible()->exists(), 404);

        return Inertia::render('public/events/show', [
            'event' => self::payload($event->load(['organizer:id,name', 'media']), includeDescription: true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function payload(Event $event, bool $includeDescription = false): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'slug' => $event->slug,
            'excerpt' => $event->excerpt,
            'location' => $event->location,
            'category' => $event->category,
            'starts_at' => $event->starts_at?->toISOString(),
            'ends_at' => $event->ends_at?->toISOString(),
            'image_url' => $event->getFirstMediaUrl('banner') ?: null,
            'organizer' => $event->organizer ? ['name' => $event->organizer->name] : null,
            ...($includeDescription ? ['description' => $event->description] : []),
        ];
    }
}
