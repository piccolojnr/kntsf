<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateContentSettingsRequest;
use App\Support\ContentSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContentSettingsController extends Controller
{
    public function edit(Request $request, ContentSettings $contentSettings): Response
    {
        abort_unless($request->user()?->can('content_settings.view'), 403);

        return Inertia::render('settings/content-settings', [
            'settings' => $contentSettings->all(),
            'can' => [
                'update' => $request->user()?->can('content_settings.update') ?? false,
            ],
        ]);
    }

    public function update(
        UpdateContentSettingsRequest $request,
        ContentSettings $contentSettings,
    ): RedirectResponse {
        $contentSettings->update($request->validated());

        return back();
    }
}
