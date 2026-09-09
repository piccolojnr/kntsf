<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePlatformSettingsRequest;
use App\Support\PlatformSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class PlatformSettingsController extends Controller
{
    public function edit(Request $request, PlatformSettings $platformSettings): Response
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        return Inertia::render('settings/platform-settings', [
            'settings' => $this->payload($platformSettings),
            'can' => [
                'update' => $request->user()?->can('settings.update') ?? false,
            ],
        ]);
    }

    public function update(
        UpdatePlatformSettingsRequest $request,
        PlatformSettings $platformSettings,
    ): RedirectResponse {
        $platformSettings->update($request->validated());
        $platformSettings->applyToConfig();
        app('mail.manager')->forgetMailers();
        Artisan::call('queue:restart');

        return back();
    }

    /**
     * @return array{paystack: array{payment_url: string, public_key_configured: bool, secret_key_configured: bool, webhook_secret_configured: bool}, mail: array{mailer: string, host: string|null, port: int|null, scheme: string|null, username: string|null, password_configured: bool, from_address: string, from_name: string}}
     */
    private function payload(PlatformSettings $platformSettings): array
    {
        $settings = $platformSettings->all();
        $configured = $platformSettings->configured();

        return [
            'paystack' => [
                'payment_url' => $settings['paystack']['payment_url'],
                'public_key_configured' => $configured['paystack']['public_key'],
                'secret_key_configured' => $configured['paystack']['secret_key'],
                'webhook_secret_configured' => $configured['paystack']['webhook_secret'],
            ],
            'mail' => [
                'mailer' => $settings['mail']['mailer'],
                'host' => $settings['mail']['host'],
                'port' => $settings['mail']['port'],
                'scheme' => $settings['mail']['scheme'],
                'username' => $settings['mail']['username'],
                'password_configured' => $configured['mail']['password'],
                'from_address' => $settings['mail']['from_address'],
                'from_name' => $settings['mail']['from_name'],
            ],
        ];
    }
}
