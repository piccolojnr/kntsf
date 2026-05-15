<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\Election;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Support\ContentSettings;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(ContentSettings $contentSettings): Response
    {
        $settings = $contentSettings->all();
        $limit = $settings['homepage_featured_limit'];

        return Inertia::render('public/home', [
            'announcements' => $settings['allow_public_news']
                ? Announcement::query()
                    ->published()
                    ->publicVisible()
                    ->featured()
                    ->with(['author:id,name', 'media'])
                    ->latest('published_at')
                    ->limit($limit)
                    ->get()
                    ->map(fn (Announcement $announcement): array => PublicAnnouncementController::payload($announcement))
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
                : [],
            'documents' => $settings['allow_public_documents']
                ? Document::query()
                    ->published()
                    ->publicVisible()
                    ->featured()
                    ->with(['author:id,name', 'media'])
                    ->latest('published_at')
                    ->limit($limit)
                    ->get()
                    ->map(fn (Document $document): array => PublicDocumentController::payload($document))
                : [],
            'executives' => ExecutiveProfile::query()
                ->published()
                ->with(['user:id,name', 'media'])
                ->orderBy('sort_order')
                ->limit(4)
                ->get()
                ->map(fn (ExecutiveProfile $profile): array => PublicExecutiveController::payload($profile)),
            'elections' => Election::query()
                ->publicVisible()
                ->with(['academicPeriod:id,name,academic_year,semester'])
                ->withCount('votes')
                ->latest('starts_at')
                ->limit(3)
                ->get()
                ->map(fn (Election $election): array => PublicElectionController::payload($election)),
        ]);
    }
}
