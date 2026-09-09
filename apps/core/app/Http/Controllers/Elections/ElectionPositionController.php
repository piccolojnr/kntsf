<?php

namespace App\Http\Controllers\Elections;

use App\Actions\Elections\CreateElectionPositionAction;
use App\Actions\Elections\DeleteElectionPositionAction;
use App\Actions\Elections\UpdateElectionPositionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Elections\StoreElectionPositionRequest;
use App\Http\Requests\Elections\UpdateElectionPositionRequest;
use App\Models\Election;
use App\Models\ElectionPosition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ElectionPositionController extends Controller
{
    public function store(
        StoreElectionPositionRequest $request,
        Election $election,
        CreateElectionPositionAction $createElectionPosition,
    ): RedirectResponse {
        $createElectionPosition->handle($election, $request->user(), $request->validated());

        return back();
    }

    public function update(
        UpdateElectionPositionRequest $request,
        ElectionPosition $position,
        UpdateElectionPositionAction $updateElectionPosition,
    ): RedirectResponse {
        $updateElectionPosition->handle($position, $request->user(), $request->validated());

        return back();
    }

    public function destroy(
        Request $request,
        ElectionPosition $position,
        DeleteElectionPositionAction $deleteElectionPosition,
    ): RedirectResponse {
        Gate::authorize('update', $position->election);
        $deleteElectionPosition->handle($position, $request->user());

        return back();
    }
}
