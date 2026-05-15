<?php

namespace App\Http\Controllers\Elections;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Elections\ApproveCandidateAction;
use App\Actions\Elections\ArchiveElectionAction;
use App\Actions\Elections\CastElectionVoteAction;
use App\Actions\Elections\CloseElectionAction;
use App\Actions\Elections\CreateElectionAction;
use App\Actions\Elections\PublishElectionAction;
use App\Actions\Elections\RejectCandidateAction;
use App\Actions\Elections\StartElectionAction;
use App\Actions\Elections\UpdateElectionAction;
use App\Actions\Elections\WithdrawCandidateAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Elections\CastElectionVoteRequest;
use App\Http\Requests\Elections\StoreElectionRequest;
use App\Http\Requests\Elections\UpdateElectionRequest;
use App\Models\AcademicPeriod;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use App\Models\Student;
use App\Support\AuditEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Election::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $elections = Election::query()
            ->with('academicPeriod:id,name,academic_year,semester', 'creator:id,name,email')
            ->withCount(['positions', 'votes'])
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Election $election): array => $this->payload($election, $request));

        return Inertia::render('elections/index', [
            'elections' => $elections,
            'filters' => ['search' => $search, 'status' => $status],
            'overview' => [
                'total' => Election::query()->count(),
                'active' => Election::query()->where('status', 'active')->count(),
                'closed' => Election::query()->where('status', 'closed')->count(),
                'archived' => Election::query()->where('status', 'archived')->count(),
            ],
            'can' => $this->permissions($request, null),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Election::class);

        return Inertia::render('elections/create', [
            'defaults' => $this->defaults(),
            'academicPeriods' => AcademicPeriod::query()->latest()->get(['id', 'name', 'academic_year', 'semester']),
        ]);
    }

    public function store(StoreElectionRequest $request, CreateElectionAction $createElection): RedirectResponse
    {
        $election = $createElection->handle($request->user(), $request->validated());

        return to_route('elections.show', $election);
    }

    public function show(Request $request, Election $election): Response
    {
        Gate::authorize('view', $election);

        return Inertia::render('elections/show', [
            'election' => $this->payload($election->load('academicPeriod', 'creator', 'positions.candidates.student', 'positions.candidates.votes'), $request),
            'options' => $this->formOptions(),
            'can' => $this->permissions($request, $election),
        ]);
    }

    public function edit(Election $election): Response
    {
        Gate::authorize('update', $election);

        return Inertia::render('elections/edit', [
            'election' => $this->payload($election->load('academicPeriod', 'creator', 'positions'), request()),
            'defaults' => $this->defaults(),
            'academicPeriods' => AcademicPeriod::query()->latest()->get(['id', 'name', 'academic_year', 'semester']),
        ]);
    }

    public function update(UpdateElectionRequest $request, Election $election, UpdateElectionAction $updateElection): RedirectResponse
    {
        $updateElection->handle($election, $request->user(), $request->validated());

        return to_route('elections.show', $election);
    }

    public function publish(Request $request, Election $election, PublishElectionAction $action): RedirectResponse
    {
        Gate::authorize('publish', $election);
        $action->handle($election, $request->user());

        return back();
    }

    public function start(Request $request, Election $election, StartElectionAction $action): RedirectResponse
    {
        Gate::authorize('publish', $election);
        $action->handle($election, $request->user());

        return back();
    }

    public function close(Request $request, Election $election, CloseElectionAction $action): RedirectResponse
    {
        Gate::authorize('publish', $election);
        $action->handle($election, $request->user());

        return back();
    }

    public function archive(Request $request, Election $election, ArchiveElectionAction $action): RedirectResponse
    {
        Gate::authorize('publish', $election);
        $action->handle($election, $request->user());

        return back();
    }

    public function approveCandidate(Request $request, ElectionCandidate $candidate, ApproveCandidateAction $action): RedirectResponse
    {
        Gate::authorize('manageCandidates', $candidate->position->election);
        $action->handle($candidate, $request->user());

        return back();
    }

    public function rejectCandidate(Request $request, ElectionCandidate $candidate, RejectCandidateAction $action): RedirectResponse
    {
        Gate::authorize('manageCandidates', $candidate->position->election);
        $action->handle($candidate, $request->user());

        return back();
    }

    public function withdrawCandidate(Request $request, ElectionCandidate $candidate, WithdrawCandidateAction $action): RedirectResponse
    {
        Gate::authorize('manageCandidates', $candidate->position->election);
        $action->handle($candidate, $request->user());

        return back();
    }

    public function vote(
        CastElectionVoteRequest $request,
        Election $election,
        ElectionPosition $position,
        CastElectionVoteAction $action
    ): RedirectResponse {
        $candidate = ElectionCandidate::query()->findOrFail($request->validated('election_candidate_id'));

        $action->handle($election, $position, $candidate, $request->user());

        return back();
    }

    public function destroy(Request $request, Election $election, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('delete', $election);
        $oldValues = $election->only(['title', 'slug', 'status']);
        $election->delete();
        $createAuditLog->handle(actor: $request->user(), event: AuditEvents::ElectionArchived, auditable: $election, subject: $election, description: 'Election deleted.', oldValues: $oldValues, request: $request);

        return to_route('elections.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Election $election, Request $request): array
    {
        $election->loadMissing('academicPeriod', 'creator', 'positions.candidates.student', 'positions.candidates.votes');
        $canViewResults = $request->user()?->can('viewResults', $election) ?? false;

        return [
            'id' => $election->id,
            'academic_period_id' => $election->academic_period_id,
            'title' => $election->title,
            'slug' => $election->slug,
            'description' => $election->description,
            'status' => $election->status->value,
            'starts_at' => $election->starts_at?->toISOString(),
            'ends_at' => $election->ends_at?->toISOString(),
            'results_visible' => $election->results_visible,
            'is_open' => $election->isOpenForVoting(),
            'votes_count' => $election->votes_count ?? $election->votes()->count(),
            'academic_period' => [
                'id' => $election->academicPeriod->id,
                'name' => $election->academicPeriod->name,
                'academic_year' => $election->academicPeriod->academic_year,
            ],
            'creator' => ['id' => $election->creator->id, 'name' => $election->creator->name],
            'positions' => $election->positions->map(fn (ElectionPosition $position): array => [
                'id' => $position->id,
                'title' => $position->title,
                'description' => $position->description,
                'max_winners' => $position->max_winners,
                'status' => $position->status->value,
                'sort_order' => $position->sort_order,
                'candidates' => $position->candidates->map(fn (ElectionCandidate $candidate): array => [
                    'id' => $candidate->id,
                    'student_id' => $candidate->student_id,
                    'student_name' => $candidate->student->name,
                    'student_number' => $candidate->student->student_number,
                    'slogan' => $candidate->slogan,
                    'manifesto' => $candidate->manifesto,
                    'status' => $candidate->status->value,
                    'poster_url' => $candidate->getFirstMediaUrl('poster') ?: null,
                    'votes_count' => $canViewResults ? $candidate->votes->count() : null,
                ])->values()->all(),
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaults(): array
    {
        return ['status' => 'draft', 'results_visible' => false];
    }

    /**
     * @return array<string, bool>
     */
    private function permissions(Request $request, ?Election $election): array
    {
        return [
            'create' => $request->user()?->can('create', Election::class) ?? false,
            'update' => $election ? ($request->user()?->can('update', $election) ?? false) : ($request->user()?->can('elections.update') ?? false),
            'publish' => $election ? ($request->user()?->can('publish', $election) ?? false) : ($request->user()?->can('elections.publish') ?? false),
            'manage_candidates' => $election ? ($request->user()?->can('manageCandidates', $election) ?? false) : ($request->user()?->can('elections.manage_candidates') ?? false),
            'vote' => $election ? ($request->user()?->can('vote', $election) ?? false) : ($request->user()?->can('elections.vote') ?? false),
            'view_results' => $election ? ($request->user()?->can('viewResults', $election) ?? false) : ($request->user()?->can('elections.view_results') ?? false),
            'delete' => $election ? ($request->user()?->can('delete', $election) ?? false) : ($request->user()?->can('elections.delete') ?? false),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'students' => Student::query()
                ->orderBy('student_number')
                ->get(['id', 'student_number', 'name', 'email'])
                ->map(fn (Student $student): array => [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'email' => $student->email,
                    'label' => trim($student->student_number.' - '.($student->name ?? 'Unnamed student')),
                ])
                ->values()
                ->all(),
        ];
    }
}
