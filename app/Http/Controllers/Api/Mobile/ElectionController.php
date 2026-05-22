<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Actions\Elections\CastElectionVoteAction;
use App\Enums\CandidateStatus;
use App\Enums\ElectionStatus;
use App\Enums\PermitStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\ElectionCandidateResource;
use App\Http\Resources\Mobile\ElectionResource;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ElectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $this->student($request);

        $elections = Election::query()
            ->with(['academicPeriod', 'votes' => fn ($query) => $query->where('student_id', $student->id)])
            ->withCount('positions')
            ->where(function (Builder $query): void {
                $query->whereIn('status', [ElectionStatus::Active, ElectionStatus::Scheduled])
                    ->orWhere(function (Builder $query): void {
                        $query->where('status', ElectionStatus::Closed)
                            ->where('results_visible', true);
                    });
            })
            ->orderByRaw("case when status = 'active' then 0 when status = 'scheduled' then 1 else 2 end")
            ->orderBy('starts_at')
            ->get();

        return response()->json([
            'data' => ElectionResource::collection($elections),
        ]);
    }

    public function show(Request $request, Election $election): ElectionResource
    {
        $student = $this->student($request);

        abort_unless($this->isVisibleToStudent($election, $request), 404);

        $election = $this->loadElectionDetail($election, $student);
        $election->eligibility = $this->eligibility($request, $election, $student);

        return new ElectionResource($election);
    }

    public function vote(
        Request $request,
        Election $election,
        ElectionPosition $position,
        CastElectionVoteAction $castElectionVote,
    ): ElectionResource|JsonResponse {
        $student = $this->student($request);
        abort_unless($position->election_id === $election->id, 404);

        $validated = $request->validate([
            'election_candidate_id' => ['required', 'integer', 'exists:election_candidates,id'],
        ]);

        $candidate = ElectionCandidate::query()->findOrFail($validated['election_candidate_id']);

        try {
            $castElectionVote->handle($election, $position, $candidate, $request->user());
        } catch (ValidationException $exception) {
            throw $exception;
        }

        $election = $this->loadElectionDetail($election->refresh(), $student);
        $election->eligibility = $this->eligibility($request, $election, $student);

        return new ElectionResource($election);
    }

    public function results(Request $request, Election $election): JsonResponse
    {
        $this->student($request);

        if (! Gate::forUser($request->user())->allows('viewResults', $election)) {
            abort(403, 'Election results are not visible yet.');
        }

        $election->load([
            'positions.candidates' => fn ($query) => $query
                ->where('status', CandidateStatus::Approved)
                ->with(['student'])
                ->withCount('votes')
                ->orderByDesc('votes_count')
                ->orderBy('id'),
        ]);

        return response()->json([
            'data' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status->value,
                'results_visible' => (bool) $election->results_visible,
                'positions' => $election->positions->map(fn (ElectionPosition $position): array => [
                    'id' => $position->id,
                    'title' => $position->title,
                    'candidates' => ElectionCandidateResource::collection($position->candidates),
                    'total_votes' => $position->candidates->sum('votes_count'),
                ])->values(),
            ],
        ]);
    }

    private function loadElectionDetail(Election $election, Student $student): Election
    {
        return $election->load([
            'academicPeriod',
            'votes' => fn ($query) => $query->where('student_id', $student->id),
            'positions.votes' => fn ($query) => $query->where('student_id', $student->id),
            'positions.candidates' => fn ($query) => $query
                ->where('status', CandidateStatus::Approved)
                ->with('student')
                ->orderBy('id'),
        ])->loadCount('positions');
    }

    private function eligibility(Request $request, Election $election, Student $student): array
    {
        $reasons = [];

        if (! $request->user()?->is_active || $request->user()?->password === null) {
            $reasons[] = 'student_account_inactive';
        }

        if (! $this->hasActivePermit($student, $election)) {
            $reasons[] = 'missing_active_permit';
        }

        if ($election->status !== ElectionStatus::Active) {
            $reasons[] = 'election_not_active';
        }

        if ($election->starts_at !== null && $election->starts_at->isFuture()) {
            $reasons[] = 'voting_not_started';
        }

        if ($election->ends_at !== null && $election->ends_at->isPast()) {
            $reasons[] = 'voting_ended';
        }

        return [
            'eligible' => $reasons === [],
            'reasons' => $reasons,
        ];
    }

    private function isVisibleToStudent(Election $election, Request $request): bool
    {
        return in_array($election->status, [ElectionStatus::Active, ElectionStatus::Scheduled], true)
            || ($election->status === ElectionStatus::Closed && Gate::forUser($request->user())->allows('viewResults', $election));
    }

    private function hasActivePermit(Student $student, Election $election): bool
    {
        return $student->permits()
            ->where('academic_period_id', $election->academic_period_id)
            ->where('status', PermitStatus::Active)
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>=', now())
            ->exists();
    }

    private function student(Request $request): Student
    {
        $student = $request->user()?->student;

        abort_unless($student instanceof Student, 403, 'This endpoint is only available to linked student accounts.');

        return $student;
    }
}
