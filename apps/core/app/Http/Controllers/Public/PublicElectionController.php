<?php

namespace App\Http\Controllers\Public;

use App\Enums\CandidateStatus;
use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use Inertia\Inertia;
use Inertia\Response;

class PublicElectionController extends Controller
{
    public function index(): Response
    {
        $elections = Election::query()
            ->publicVisible()
            ->with(['academicPeriod:id,name,academic_year,semester'])
            ->withCount('votes')
            ->latest('starts_at')
            ->paginate(9)
            ->through(fn (Election $election): array => self::payload($election));

        return Inertia::render('public/elections/index', [
            'elections' => $elections,
        ]);
    }

    public function show(Election $election): Response
    {
        abort_unless($election->newQuery()->whereKey($election->id)->publicVisible()->exists(), 404);

        return Inertia::render('public/elections/show', [
            'election' => self::payload(
                $election->load([
                    'academicPeriod:id,name,academic_year,semester',
                    'positions.candidates.student:id,student_number,name',
                    'positions.candidates.votes',
                    'positions.candidates.media',
                ])->loadCount('votes'),
                includeDetails: true,
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function payload(Election $election, bool $includeDetails = false): array
    {
        return [
            'id' => $election->id,
            'title' => $election->title,
            'slug' => $election->slug,
            'description' => $election->description,
            'status' => $election->status->value,
            'starts_at' => $election->starts_at?->toISOString(),
            'ends_at' => $election->ends_at?->toISOString(),
            'results_visible' => $election->results_visible,
            'votes_count' => $election->results_visible ? ($election->votes_count ?? $election->votes()->count()) : null,
            'academic_period' => [
                'name' => $election->academicPeriod->name,
                'academic_year' => $election->academicPeriod->academic_year,
                'semester' => $election->academicPeriod->semester,
            ],
            ...($includeDetails ? [
                'positions' => $election->positions->map(fn (ElectionPosition $position): array => [
                    'id' => $position->id,
                    'title' => $position->title,
                    'description' => $position->description,
                    'max_winners' => $position->max_winners,
                    'candidates' => $position->candidates
                        ->filter(fn (ElectionCandidate $candidate): bool => $candidate->status === CandidateStatus::Approved)
                        ->map(fn (ElectionCandidate $candidate): array => [
                            'id' => $candidate->id,
                            'student_name' => $candidate->student->name,
                            'student_number' => $candidate->student->student_number,
                            'slogan' => $candidate->slogan,
                            'manifesto' => $candidate->manifesto,
                            'poster_url' => $candidate->getFirstMediaUrl('poster') ?: null,
                            'votes_count' => $election->results_visible ? $candidate->votes->count() : null,
                        ])
                        ->values()
                        ->all(),
                ])->values()->all(),
            ] : []),
        ];
    }
}
