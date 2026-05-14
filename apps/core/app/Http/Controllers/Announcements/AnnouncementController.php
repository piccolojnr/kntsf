<?php

namespace App\Http\Controllers\Announcements;

use App\Actions\Announcements\ArchiveAnnouncementAction;
use App\Actions\Announcements\CreateAnnouncementAction;
use App\Actions\Announcements\PublishAnnouncementAction;
use App\Actions\Announcements\UpdateAnnouncementAction;
use App\Actions\Audit\CreateAuditLogAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Announcements\PublishAnnouncementRequest;
use App\Http\Requests\Announcements\StoreAnnouncementRequest;
use App\Http\Requests\Announcements\UpdateAnnouncementRequest;
use App\Models\Announcement;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Announcement::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $announcements = Announcement::query()
            ->with('author:id,name,email')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Announcement $announcement): array => $this->payload($announcement));

        return Inertia::render('announcements/index', [
            'announcements' => $announcements,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'overview' => [
                'total' => Announcement::query()->count(),
                'draft' => Announcement::query()->where('status', 'draft')->count(),
                'published' => Announcement::query()->where('status', 'published')->count(),
                'featured' => Announcement::query()->where('is_featured', true)->count(),
            ],
            'can' => [
                'create' => $request->user()?->can('create', Announcement::class) ?? false,
                'update' => $request->user()?->can('announcements.update') ?? false,
                'publish' => $request->user()?->can('announcements.publish') ?? false,
                'delete' => $request->user()?->can('announcements.delete') ?? false,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Announcement::class);

        return Inertia::render('announcements/create', [
            'defaults' => $this->defaults(),
        ]);
    }

    public function store(StoreAnnouncementRequest $request, CreateAnnouncementAction $createAnnouncement): RedirectResponse
    {
        $announcement = $createAnnouncement->handle($request->user(), $request->validated());

        return to_route('announcements.show', $announcement);
    }

    public function show(Request $request, Announcement $announcement): Response
    {
        Gate::authorize('view', $announcement);

        return Inertia::render('announcements/show', [
            'announcement' => $this->payload($announcement->load('author:id,name,email')),
            'can' => [
                'update' => $request->user()?->can('update', $announcement) ?? false,
                'publish' => $request->user()?->can('publish', $announcement) ?? false,
                'archive' => $request->user()?->can('archive', $announcement) ?? false,
                'delete' => $request->user()?->can('delete', $announcement) ?? false,
            ],
        ]);
    }

    public function edit(Announcement $announcement): Response
    {
        Gate::authorize('update', $announcement);

        return Inertia::render('announcements/edit', [
            'announcement' => $this->payload($announcement->load('author:id,name,email')),
            'defaults' => $this->defaults(),
        ]);
    }

    public function update(
        UpdateAnnouncementRequest $request,
        Announcement $announcement,
        UpdateAnnouncementAction $updateAnnouncement
    ): RedirectResponse {
        $updateAnnouncement->handle($announcement, $request->user(), $request->validated());

        return to_route('announcements.show', $announcement);
    }

    public function publish(
        PublishAnnouncementRequest $request,
        Announcement $announcement,
        PublishAnnouncementAction $publishAnnouncement
    ): RedirectResponse {
        $publishAnnouncement->handle($announcement, $request->user(), $request->validated('published_at'));

        return back();
    }

    public function archive(Request $request, Announcement $announcement, ArchiveAnnouncementAction $archiveAnnouncement): RedirectResponse
    {
        Gate::authorize('archive', $announcement);

        $archiveAnnouncement->handle($announcement, $request->user());

        return back();
    }

    public function destroy(Request $request, Announcement $announcement, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('delete', $announcement);

        $oldValues = $announcement->only(['title', 'slug', 'status', 'visibility']);

        $announcement->delete();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::AnnouncementDeleted,
            auditable: $announcement,
            subject: $announcement,
            description: 'Announcement deleted.',
            oldValues: $oldValues,
            request: $request,
        );

        return to_route('announcements.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Announcement $announcement): array
    {
        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'slug' => $announcement->slug,
            'excerpt' => $announcement->excerpt,
            'content' => $announcement->content,
            'category' => $announcement->category,
            'status' => $announcement->status->value,
            'visibility' => $announcement->visibility->value,
            'is_featured' => $announcement->is_featured,
            'published_at' => $announcement->published_at?->toISOString(),
            'archived_at' => $announcement->archived_at?->toISOString(),
            'created_at' => $announcement->created_at?->toISOString(),
            'updated_at' => $announcement->updated_at?->toISOString(),
            'featured_image_url' => $announcement->getFirstMediaUrl(MediaCollections::FEATURED_IMAGE) ?: null,
            'author' => [
                'id' => $announcement->author->id,
                'name' => $announcement->author->name,
                'email' => $announcement->author->email,
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
