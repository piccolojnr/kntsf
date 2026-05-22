<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\AnnouncementResource;
use App\Http\Resources\Mobile\DocumentResource;
use App\Http\Resources\Mobile\EventResource;
use App\Http\Resources\Mobile\ExecutiveProfileResource;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Support\ContentSettings;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContentController extends Controller
{
    public function home(ContentSettings $contentSettings): array
    {
        $settings = $contentSettings->all();
        $limit = (int) $settings['homepage_featured_limit'];

        return [
            'announcements' => $settings['allow_public_news']
                ? AnnouncementResource::collection($this->baseAnnouncementQuery()->featured()->latest('published_at')->limit($limit)->get())
                : [],
            'events' => $settings['allow_public_events']
                ? EventResource::collection($this->baseEventQuery()->upcoming()->orderBy('starts_at')->limit($limit)->get())
                : [],
            'documents' => $settings['allow_public_documents']
                ? DocumentResource::collection($this->baseDocumentQuery()->featured()->latest('published_at')->limit($limit)->get())
                : [],
            'executives' => ExecutiveProfileResource::collection($this->baseExecutiveQuery()->limit(4)->get()),
        ];
    }

    public function announcements(Request $request, ContentSettings $contentSettings): AnonymousResourceCollection
    {
        abort_unless($contentSettings->all()['allow_public_news'], 404);

        $announcements = $this->baseAnnouncementQuery()
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = $request->string('search')->toString();

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category'), fn (Builder $query): Builder => $query->where('category', $request->string('category')->toString()))
            ->when($request->boolean('featured'), fn (Builder $query): Builder => $query->featured())
            ->latest('published_at')
            ->paginate($this->perPage($request))
            ->withQueryString();

        return AnnouncementResource::collection($announcements);
    }

    public function announcementShow(Announcement $announcement, ContentSettings $contentSettings): AnnouncementResource
    {
        abort_unless($contentSettings->all()['allow_public_news'], 404);
        abort_unless($announcement->newQuery()->whereKey($announcement->id)->published()->publicVisible()->exists(), 404);

        return new AnnouncementResource($announcement->load(['author:id,name', 'media']));
    }

    public function events(Request $request, ContentSettings $contentSettings): AnonymousResourceCollection
    {
        abort_unless($contentSettings->all()['allow_public_events'], 404);

        $events = $this->baseEventQuery()
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = $request->string('search')->toString();

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category'), fn (Builder $query): Builder => $query->where('category', $request->string('category')->toString()))
            ->when($request->boolean('featured'), fn (Builder $query): Builder => $query->featured())
            ->when($request->boolean('upcoming'), fn (Builder $query): Builder => $query->upcoming())
            ->orderByRaw('starts_at is null')
            ->orderBy('starts_at')
            ->paginate($this->perPage($request))
            ->withQueryString();

        return EventResource::collection($events);
    }

    public function eventShow(Event $event, ContentSettings $contentSettings): EventResource
    {
        abort_unless($contentSettings->all()['allow_public_events'], 404);
        abort_unless($event->newQuery()->whereKey($event->id)->published()->publicVisible()->exists(), 404);

        return new EventResource($event->load(['organizer:id,name', 'media']));
    }

    public function documents(Request $request, ContentSettings $contentSettings): AnonymousResourceCollection
    {
        abort_unless($contentSettings->all()['allow_public_documents'], 404);

        $documents = $this->baseDocumentQuery()
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = $request->string('search')->toString();

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category'), fn (Builder $query): Builder => $query->where('category', $request->string('category')->toString()))
            ->when($request->boolean('featured'), fn (Builder $query): Builder => $query->featured())
            ->latest('published_at')
            ->paginate($this->perPage($request))
            ->withQueryString();

        return DocumentResource::collection($documents);
    }

    public function documentShow(Document $document, ContentSettings $contentSettings): DocumentResource
    {
        abort_unless($contentSettings->all()['allow_public_documents'], 404);
        abort_unless($document->newQuery()->whereKey($document->id)->published()->publicVisible()->exists(), 404);

        return new DocumentResource($document->load(['author:id,name', 'media']));
    }

    public function executives(Request $request): AnonymousResourceCollection
    {
        $executives = $this->baseExecutiveQuery()
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = $request->string('search')->toString();

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('position', 'like', "%{$search}%")
                        ->orWhere('biography', 'like', "%{$search}%")
                        ->orWhereHas('user', fn (Builder $query): Builder => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->paginate($this->perPage($request))
            ->withQueryString();

        return ExecutiveProfileResource::collection($executives);
    }

    /**
     * @return Builder<Announcement>
     */
    private function baseAnnouncementQuery(): Builder
    {
        return Announcement::query()
            ->published()
            ->publicVisible()
            ->with(['author:id,name', 'media']);
    }

    /**
     * @return Builder<Event>
     */
    private function baseEventQuery(): Builder
    {
        return Event::query()
            ->published()
            ->publicVisible()
            ->with(['organizer:id,name', 'media']);
    }

    /**
     * @return Builder<Document>
     */
    private function baseDocumentQuery(): Builder
    {
        return Document::query()
            ->published()
            ->publicVisible()
            ->with(['author:id,name', 'media']);
    }

    /**
     * @return Builder<ExecutiveProfile>
     */
    private function baseExecutiveQuery(): Builder
    {
        return ExecutiveProfile::query()
            ->published()
            ->with(['user:id,name', 'media'])
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    private function perPage(Request $request): int
    {
        return max(1, min($request->integer('per_page', 10), 25));
    }
}
