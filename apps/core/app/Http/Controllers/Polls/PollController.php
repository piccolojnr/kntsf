<?php

namespace App\Http\Controllers\Polls;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Polls\ArchivePollAction;
use App\Actions\Polls\CastPollVoteAction;
use App\Actions\Polls\CreatePollAction;
use App\Actions\Polls\MergePollOptionAction;
use App\Actions\Polls\PublishPollAction;
use App\Actions\Polls\UpdatePollAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Polls\CastPollVoteRequest;
use App\Http\Requests\Polls\MergePollOptionRequest;
use App\Http\Requests\Polls\PublishPollRequest;
use App\Http\Requests\Polls\StorePollRequest;
use App\Http\Requests\Polls\UpdatePollRequest;
use App\Models\Poll;
use App\Models\PollOption;
use App\Support\AuditEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PollController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Poll::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $polls = Poll::query()
            ->with('creator:id,name,email')
            ->withCount(['options', 'votes'])
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Poll $poll): array => $this->payload($poll, $request));

        return Inertia::render('polls/index', [
            'polls' => $polls,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'overview' => [
                'total' => Poll::query()->count(),
                'draft' => Poll::query()->where('status', 'draft')->count(),
                'published' => Poll::query()->where('status', 'published')->count(),
                'archived' => Poll::query()->where('status', 'archived')->count(),
            ],
            'can' => [
                'create' => $request->user()?->can('create', Poll::class) ?? false,
                'update' => $request->user()?->can('polls.update') ?? false,
                'publish' => $request->user()?->can('polls.publish') ?? false,
                'delete' => $request->user()?->can('polls.delete') ?? false,
                'vote' => $request->user()?->can('polls.vote') ?? false,
                'view_results' => $request->user()?->can('polls.view_results') ?? false,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Poll::class);

        return Inertia::render('polls/create', [
            'defaults' => $this->defaults(),
        ]);
    }

    public function store(StorePollRequest $request, CreatePollAction $createPoll): RedirectResponse
    {
        $poll = $createPoll->handle($request->user(), $request->validated());

        return to_route('polls.show', $poll);
    }

    public function show(Request $request, Poll $poll): Response
    {
        Gate::authorize('view', $poll);

        return Inertia::render('polls/show', [
            'poll' => $this->payload($poll->load('creator:id,name,email', 'options.votes'), $request),
            'can' => [
                'update' => $request->user()?->can('update', $poll) ?? false,
                'publish' => $request->user()?->can('publish', $poll) ?? false,
                'archive' => $request->user()?->can('archive', $poll) ?? false,
                'delete' => $request->user()?->can('delete', $poll) ?? false,
                'vote' => $request->user()?->can('vote', $poll) ?? false,
                'view_results' => $request->user()?->can('viewResults', $poll) ?? false,
                'merge_options' => $request->user()?->can('mergeOption', $poll) ?? false,
            ],
        ]);
    }

    public function edit(Poll $poll): Response
    {
        Gate::authorize('update', $poll);

        return Inertia::render('polls/edit', [
            'poll' => $this->payload($poll->load('creator:id,name,email', 'options'), request()),
            'defaults' => $this->defaults(),
        ]);
    }

    public function update(UpdatePollRequest $request, Poll $poll, UpdatePollAction $updatePoll): RedirectResponse
    {
        $updatePoll->handle($poll, $request->user(), $request->validated());

        return to_route('polls.show', $poll);
    }

    public function publish(PublishPollRequest $request, Poll $poll, PublishPollAction $publishPoll): RedirectResponse
    {
        $publishPoll->handle($poll, $request->user());

        return back();
    }

    public function archive(Request $request, Poll $poll, ArchivePollAction $archivePoll): RedirectResponse
    {
        Gate::authorize('archive', $poll);

        $archivePoll->handle($poll, $request->user());

        return back();
    }

    public function destroy(Request $request, Poll $poll, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('delete', $poll);

        $oldValues = $poll->only(['title', 'slug', 'type', 'status', 'visibility']);

        $poll->delete();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::PollDeleted,
            auditable: $poll,
            subject: $poll,
            description: 'Poll deleted.',
            oldValues: $oldValues,
            request: $request,
        );

        return to_route('polls.index');
    }

    public function vote(CastPollVoteRequest $request, Poll $poll, CastPollVoteAction $castPollVote): RedirectResponse
    {
        $castPollVote->handle($poll, $request->user(), $request->validated());

        return back();
    }

    public function mergeOption(
        MergePollOptionRequest $request,
        Poll $poll,
        PollOption $option,
        MergePollOptionAction $mergePollOption
    ): RedirectResponse {
        $targetOption = $poll->options()->findOrFail($request->validated('target_option_id'));

        $mergePollOption->handle($poll, $option, $targetOption, $request->user());

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Poll $poll, Request $request): array
    {
        $poll->loadMissing('creator:id,name,email', 'options.votes');

        $studentId = $request->user()?->student?->id;
        $userVote = $studentId === null
            ? null
            : $poll->votes()->where('student_id', $studentId)->first();
        $canViewResults = $request->user()?->can('viewResults', $poll) ?? false;

        return [
            'id' => $poll->id,
            'title' => $poll->title,
            'slug' => $poll->slug,
            'description' => $poll->description,
            'type' => $poll->type->value,
            'status' => $poll->status->value,
            'visibility' => $poll->visibility->value,
            'starts_at' => $poll->starts_at?->toISOString(),
            'ends_at' => $poll->ends_at?->toISOString(),
            'show_results' => $poll->show_results,
            'allow_vote_change' => $poll->allow_vote_change,
            'is_open' => $poll->isOpenForVoting(),
            'created_at' => $poll->created_at?->toISOString(),
            'updated_at' => $poll->updated_at?->toISOString(),
            'votes_count' => $poll->votes_count ?? $poll->votes()->count(),
            'options' => $poll->options->map(fn (PollOption $option): array => [
                'id' => $option->id,
                'text' => $option->text,
                'status' => $option->status->value,
                'merged_into_id' => $option->merged_into_id,
                'sort_order' => $option->sort_order,
                'votes_count' => $canViewResults ? $option->votes->count() : null,
            ])->values()->all(),
            'user_vote' => $userVote === null ? null : [
                'id' => $userVote->id,
                'poll_option_id' => $userVote->poll_option_id,
            ],
            'creator' => [
                'id' => $poll->creator->id,
                'name' => $poll->creator->name,
                'email' => $poll->creator->email,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaults(): array
    {
        return [
            'type' => 'fixed_options',
            'status' => 'draft',
            'visibility' => 'internal',
            'show_results' => true,
            'allow_vote_change' => false,
        ];
    }
}
