<?php

use App\Models\User;
use App\Support\PlatformSettings;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    config([
        'services.paystack.public_key' => null,
        'services.paystack.secret_key' => null,
        'services.paystack.webhook_secret' => null,
        'services.paystack.payment_url' => 'https://api.paystack.co',
        'mail.default' => 'smtp',
        'mail.mailers.smtp.host' => '127.0.0.1',
        'mail.mailers.smtp.port' => 1025,
        'mail.mailers.smtp.scheme' => null,
        'mail.mailers.smtp.username' => null,
        'mail.mailers.smtp.password' => null,
        'mail.from.address' => 'hello@example.com',
        'mail.from.name' => 'Laravel',
    ]);
});

function platformSettingsUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function platformSettingsPayload(array $overrides = []): array
{
    return array_replace_recursive([
        'paystack' => [
            'public_key' => 'pk_test_public',
            'secret_key' => 'sk_test_secret',
            'webhook_secret' => 'whsec_test_secret',
            'payment_url' => 'https://api.paystack.co',
        ],
        'mail' => [
            'mailer' => 'smtp',
            'host' => 'smtp.example.com',
            'port' => 587,
            'scheme' => 'tls',
            'username' => 'mailer@example.com',
            'password' => 'smtp-secret',
            'from_address' => 'src@example.com',
            'from_name' => 'SRC Permits',
        ],
    ], $overrides);
}

test('platform settings can be read by authorized user without exposing secrets', function () {
    app(PlatformSettings::class)->update(platformSettingsPayload());

    $this->actingAs(platformSettingsUserWithRole('admin'))
        ->get(route('platform-settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/platform-settings')
            ->where('settings.paystack.payment_url', 'https://api.paystack.co')
            ->where('settings.paystack.secret_key_configured', true)
            ->where('settings.paystack.webhook_secret_configured', true)
            ->where('settings.mail.host', 'smtp.example.com')
            ->where('settings.mail.password_configured', true)
            ->where('can.update', true)
            ->missing('settings.paystack.secret_key')
            ->missing('settings.paystack.webhook_secret')
            ->missing('settings.mail.password'));
});

test('platform settings can be updated by authorized user and override runtime config', function () {
    Cache::forget('illuminate:queue:restart');
    $resolvedMailerId = spl_object_id(app('mail.manager')->mailer());

    $this->actingAs(platformSettingsUserWithRole('admin'))
        ->from(route('platform-settings.edit'))
        ->patch(route('platform-settings.update'), platformSettingsPayload([
            'paystack' => [
                'payment_url' => 'https://payments.example.com',
            ],
        ]))
        ->assertRedirect(route('platform-settings.edit'));

    $settings = app(PlatformSettings::class)->all();

    expect($settings['paystack']['public_key'])->toBe('pk_test_public')
        ->and($settings['paystack']['secret_key'])->toBe('sk_test_secret')
        ->and($settings['paystack']['webhook_secret'])->toBe('whsec_test_secret')
        ->and($settings['paystack']['payment_url'])->toBe('https://payments.example.com')
        ->and($settings['mail']['host'])->toBe('smtp.example.com')
        ->and($settings['mail']['port'])->toBe(587)
        ->and($settings['mail']['scheme'])->toBe('tls')
        ->and($settings['mail']['username'])->toBe('mailer@example.com')
        ->and($settings['mail']['password'])->toBe('smtp-secret')
        ->and($settings['mail']['from_address'])->toBe('src@example.com')
        ->and(config('services.paystack.secret_key'))->toBe('sk_test_secret')
        ->and(config('mail.mailers.smtp.password'))->toBe('smtp-secret')
        ->and(config('mail.mailers.smtp.scheme'))->toBe('smtp')
        ->and(spl_object_id(app('mail.manager')->mailer()))->not->toBe($resolvedMailerId)
        ->and(Cache::get('illuminate:queue:restart'))->toBeInt();
});

test('secret values are encrypted at rest and retained when blank', function () {
    app(PlatformSettings::class)->update(platformSettingsPayload());

    $rawValue = DB::table('platform_settings')
        ->where('key', PlatformSettings::SettingKey)
        ->value('value');

    expect($rawValue)->toBeString()
        ->not->toContain('sk_test_secret')
        ->not->toContain('smtp-secret');

    app(PlatformSettings::class)->update(platformSettingsPayload([
        'paystack' => [
            'public_key' => '',
            'secret_key' => '',
            'webhook_secret' => '',
            'payment_url' => 'https://api.paystack.co',
        ],
        'mail' => [
            'password' => '',
            'host' => 'smtp2.example.com',
        ],
    ]));

    $settings = app(PlatformSettings::class)->all();

    expect($settings['paystack']['secret_key'])->toBe('sk_test_secret')
        ->and($settings['paystack']['webhook_secret'])->toBe('whsec_test_secret')
        ->and($settings['mail']['password'])->toBe('smtp-secret')
        ->and($settings['mail']['host'])->toBe('smtp2.example.com');
});

test('invalid platform setting values are rejected', function () {
    $this->actingAs(platformSettingsUserWithRole('admin'))
        ->from(route('platform-settings.edit'))
        ->patch(route('platform-settings.update'), platformSettingsPayload([
            'paystack' => [
                'payment_url' => 'not-a-url',
            ],
            'mail' => [
                'port' => 70000,
                'scheme' => 'starttls',
                'from_address' => 'not-an-email',
            ],
        ]))
        ->assertRedirect(route('platform-settings.edit'))
        ->assertSessionHasErrors([
            'paystack.payment_url',
            'mail.port',
            'mail.scheme',
            'mail.from_address',
        ]);
});

test('unauthorized user cannot update platform settings', function () {
    $this->actingAs(platformSettingsUserWithRole('staff'))
        ->from(route('platform-settings.edit'))
        ->patch(route('platform-settings.update'), platformSettingsPayload())
        ->assertForbidden();
});
