<?php

namespace App\Http\Controllers\Documents;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Documents\ArchiveDocumentAction;
use App\Actions\Documents\CreateDocumentAction;
use App\Actions\Documents\PublishDocumentAction;
use App\Actions\Documents\UpdateDocumentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\PublishDocumentRequest;
use App\Http\Requests\Documents\StoreDocumentRequest;
use App\Http\Requests\Documents\UpdateDocumentRequest;
use App\Models\Document;
use App\Support\AuditEvents;
use App\Support\MediaCollections;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Document::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $documents = Document::query()
            ->with('author:id,name,email')
            ->withCount('media')
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
            ->through(fn (Document $document): array => $this->payload($document));

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'overview' => [
                'total' => Document::query()->count(),
                'draft' => Document::query()->where('status', 'draft')->count(),
                'published' => Document::query()->where('status', 'published')->count(),
                'featured' => Document::query()->where('is_featured', true)->count(),
            ],
            'can' => [
                'create' => $request->user()?->can('create', Document::class) ?? false,
                'update' => $request->user()?->can('documents.update') ?? false,
                'publish' => $request->user()?->can('documents.publish') ?? false,
                'delete' => $request->user()?->can('documents.delete') ?? false,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Document::class);

        return Inertia::render('documents/create', [
            'defaults' => $this->defaults(),
        ]);
    }

    public function store(StoreDocumentRequest $request, CreateDocumentAction $createDocument): RedirectResponse
    {
        $document = $createDocument->handle($request->user(), $request->validated());

        return to_route('documents.show', $document);
    }

    public function show(Request $request, Document $document): Response
    {
        Gate::authorize('view', $document);

        return Inertia::render('documents/show', [
            'document' => $this->payload($document->load('author:id,name,email', 'media')),
            'can' => [
                'update' => $request->user()?->can('update', $document) ?? false,
                'publish' => $request->user()?->can('publish', $document) ?? false,
                'archive' => $request->user()?->can('archive', $document) ?? false,
                'delete' => $request->user()?->can('delete', $document) ?? false,
            ],
        ]);
    }

    public function edit(Document $document): Response
    {
        Gate::authorize('update', $document);

        return Inertia::render('documents/edit', [
            'document' => $this->payload($document->load('author:id,name,email', 'media')),
            'defaults' => $this->defaults(),
        ]);
    }

    public function update(
        UpdateDocumentRequest $request,
        Document $document,
        UpdateDocumentAction $updateDocument
    ): RedirectResponse {
        $updateDocument->handle($document, $request->user(), $request->validated());

        return to_route('documents.show', $document);
    }

    public function publish(
        PublishDocumentRequest $request,
        Document $document,
        PublishDocumentAction $publishDocument
    ): RedirectResponse {
        $publishDocument->handle($document, $request->user(), $request->validated('published_at'));

        return back();
    }

    public function archive(Request $request, Document $document, ArchiveDocumentAction $archiveDocument): RedirectResponse
    {
        Gate::authorize('archive', $document);

        $archiveDocument->handle($document, $request->user());

        return back();
    }

    public function destroy(Request $request, Document $document, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('delete', $document);

        $oldValues = $document->only(['title', 'slug', 'status', 'visibility']);

        $document->delete();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::DocumentDeleted,
            auditable: $document,
            subject: $document,
            description: 'Document deleted.',
            oldValues: $oldValues,
            request: $request,
        );

        return to_route('documents.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Document $document): array
    {
        $document->loadMissing('author:id,name,email', 'media');

        return [
            'id' => $document->id,
            'title' => $document->title,
            'slug' => $document->slug,
            'excerpt' => $document->excerpt,
            'description' => $document->description,
            'category' => $document->category,
            'status' => $document->status->value,
            'visibility' => $document->visibility->value,
            'is_featured' => $document->is_featured,
            'published_at' => $document->published_at?->toISOString(),
            'archived_at' => $document->archived_at?->toISOString(),
            'created_at' => $document->created_at?->toISOString(),
            'updated_at' => $document->updated_at?->toISOString(),
            'featured_image_url' => $document->getFirstMediaUrl(MediaCollections::FEATURED_IMAGE) ?: null,
            'files' => $document
                ->getMedia(MediaCollections::FILES)
                ->map(fn ($media): array => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'human_size' => $media->human_readable_size,
                    'url' => $media->getUrl(),
                ])
                ->values()
                ->all(),
            'author' => [
                'id' => $document->author->id,
                'name' => $document->author->name,
                'email' => $document->author->email,
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
