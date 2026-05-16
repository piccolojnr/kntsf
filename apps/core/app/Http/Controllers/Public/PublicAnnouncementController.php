<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Support\ApplicationCache;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicAnnouncementController extends Controller
{
    public function index(Request $request, ApplicationCache $cache): Response
    {
        $announcements = $cache->remember(
            ApplicationCache::PublicAnnouncements,
            'page:'.$request->integer('page', 1),
            300,
            fn () => Announcement::query()
                ->published()
                ->publicVisible()
                ->with(['author:id,name', 'media'])
                ->latest('published_at')
                ->paginate(9)
                ->through(fn (Announcement $announcement): array => self::payload($announcement)),
        );

        return Inertia::render('public/announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    public function show(Announcement $announcement, ApplicationCache $cache): Response
    {
        abort_unless($announcement->newQuery()->whereKey($announcement->id)->published()->publicVisible()->exists(), 404);

        return Inertia::render('public/announcements/show', [
            'announcement' => $cache->remember(
                ApplicationCache::PublicAnnouncements,
                'show:'.$announcement->id,
                300,
                fn (): array => self::payload($announcement->load(['author:id,name', 'media']), includeContent: true),
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function payload(Announcement $announcement, bool $includeContent = false): array
    {
        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'slug' => $announcement->slug,
            'excerpt' => $announcement->excerpt,
            'category' => $announcement->category,
            'published_at' => $announcement->published_at?->toISOString(),
            'image_url' => $announcement->getFirstMediaUrl('featured_image') ?: null,
            'author' => $announcement->author ? ['name' => $announcement->author->name] : null,
            ...($includeContent ? ['content' => $announcement->content] : []),
        ];
    }
}
