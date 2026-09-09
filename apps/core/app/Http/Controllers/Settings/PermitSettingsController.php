<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePermitSettingsRequest;
use App\Support\PermitSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermitSettingsController extends Controller
{
    public function edit(Request $request, PermitSettings $permitSettings): Response
    {
        abort_unless($request->user()?->can('permit_settings.view'), 403);

        return Inertia::render('settings/permit-settings', [
            'settings' => $permitSettings->all(),
            'can' => [
                'update' => $request->user()?->can('permit_settings.update') ?? false,
            ],
        ]);
    }

    public function update(
        UpdatePermitSettingsRequest $request,
        PermitSettings $permitSettings
    ): RedirectResponse {
        $permitSettings->update($request->validated());

        return back();
    }
}
