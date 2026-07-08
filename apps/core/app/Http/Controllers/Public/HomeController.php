<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\Election;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Support\ApplicationCache;
use App\Support\ContentSettings;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(ContentSettings $contentSettings, ApplicationCache $cache): Response
    {
        return Inertia::render('public/home', $cache->remember(
            ApplicationCache::PublicHome,
            'payload',
            300,
            function () use ($contentSettings): array {
                $settings = $contentSettings->all();
                $limit = $settings['homepage_featured_limit'];

                return [
                    'announcements' => $settings['allow_public_news']
                        ? Announcement::query()
                            ->published()
                            ->publicVisible()
                            ->with(['author:id,name', 'media'])
                            ->orderByDesc('is_featured')
                            ->latest('published_at')
                            ->limit($limit)
                            ->get()
                            ->map(fn (Announcement $announcement): array => PublicAnnouncementController::payload($announcement))
                            ->values()
                            ->all()
                        : [],
                    'events' => $settings['allow_public_events']
                        ? Event::query()
                            ->published()
                            ->publicVisible()
                            ->upcoming()
                            ->with(['organizer:id,name', 'media'])
                            ->orderBy('starts_at')
                            ->limit($limit)
                            ->get()
                            ->map(fn (Event $event): array => PublicEventController::payload($event))
                            ->values()
                            ->all()
                        : [],
                    'documents' => $settings['allow_public_documents']
                        ? Document::query()
                            ->published()
                            ->publicVisible()
                            ->with(['author:id,name', 'media'])
                            ->orderByDesc('is_featured')
                            ->latest('published_at')
                            ->limit($limit)
                            ->get()
                            ->map(fn (Document $document): array => PublicDocumentController::payload($document))
                            ->values()
                            ->all()
                        : [],
                    'executives' => ExecutiveProfile::query()
                        ->published()
                        ->with(['user:id,name', 'media'])
                        ->orderBy('sort_order')
                        ->limit(4)
                        ->get()
                        ->map(fn (ExecutiveProfile $profile): array => PublicExecutiveController::payload($profile))
                        ->values()
                        ->all(),
                    'elections' => Election::query()
                        ->publicVisible()
                        ->with(['academicPeriod:id,name,academic_year,semester'])
                        ->withCount('votes')
                        ->latest('starts_at')
                        ->limit(3)
                        ->get()
                        ->map(fn (Election $election): array => PublicElectionController::payload($election))
                        ->values()
                        ->all(),
                ];
            },
        ));
    }
}
