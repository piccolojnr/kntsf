<?php

namespace App\Http\Controllers\Elections;

use App\Actions\Elections\CreateElectionCandidateAction;
use App\Actions\Elections\UpdateElectionCandidateAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Elections\StoreElectionCandidateRequest;
use App\Http\Requests\Elections\UpdateElectionCandidateRequest;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionPosition;
use Illuminate\Http\RedirectResponse;

class ElectionCandidateController extends Controller
{
    public function store(
        StoreElectionCandidateRequest $request,
        Election $election,
        ElectionPosition $position,
        CreateElectionCandidateAction $createElectionCandidate,
    ): RedirectResponse {
        abort_unless($position->election()->is($election), 404);

        $createElectionCandidate->handle($position, $request->user(), $request->validated());

        return back();
    }

    public function update(
        UpdateElectionCandidateRequest $request,
        ElectionCandidate $candidate,
        UpdateElectionCandidateAction $updateElectionCandidate,
    ): RedirectResponse {
        $updateElectionCandidate->handle($candidate, $request->user(), $request->validated());

        return back();
    }
}
