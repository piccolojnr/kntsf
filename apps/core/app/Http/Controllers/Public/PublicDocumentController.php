<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Support\ApplicationCache;
use App\Support\ContentSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicDocumentController extends Controller
{
    public function index(Request $request, ApplicationCache $cache, ContentSettings $contentSettings): Response
    {
        abort_unless($contentSettings->all()['allow_public_documents'], 404);

        $documents = $cache->remember(
            ApplicationCache::PublicDocuments,
            'page:'.$request->integer('page', 1),
            300,
            fn () => Document::query()
                ->published()
                ->publicVisible()
                ->with(['author:id,name', 'media'])
                ->latest('published_at')
                ->paginate(9)
                ->through(fn (Document $document): array => self::payload($document))
                ->toArray(),
        );

        return Inertia::render('public/documents/index', [
            'documents' => $documents,
        ]);
    }

    public function show(Document $document, ApplicationCache $cache, ContentSettings $contentSettings): Response
    {
        abort_unless($contentSettings->all()['allow_public_documents'], 404);
        abort_unless($document->newQuery()->whereKey($document->id)->published()->publicVisible()->exists(), 404);

        return Inertia::render('public/documents/show', [
            'document' => $cache->remember(
                ApplicationCache::PublicDocuments,
                'show:'.$document->id,
                300,
                fn (): array => self::payload($document->load(['author:id,name', 'media']), includeDescription: true),
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function payload(Document $document, bool $includeDescription = false): array
    {
        return [
            'id' => $document->id,
            'title' => $document->title,
            'slug' => $document->slug,
            'excerpt' => $document->excerpt,
            'category' => $document->category,
            'published_at' => $document->published_at?->toISOString(),
            'image_url' => $document->getFirstMediaUrl('featured_image') ?: null,
            'author' => $document->author ? ['name' => $document->author->name] : null,
            'files' => $document->getMedia('files')->map(fn ($file): array => [
                'id' => $file->id,
                'file_name' => $file->file_name,
                'human_size' => $file->human_readable_size,
                'url' => $file->getUrl(),
            ])->values()->all(),
            ...($includeDescription ? ['description' => $document->description] : []),
        ];
    }
}
