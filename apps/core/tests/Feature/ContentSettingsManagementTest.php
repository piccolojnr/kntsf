<?php

use App\Models\User;
use App\Support\ContentSettings;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function contentSettingsUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('content settings can be read by authorized user', function () {
    app(ContentSettings::class)->update([
        'allow_public_news' => true,
        'allow_public_events' => true,
        'allow_public_documents' => true,
        'homepage_featured_limit' => 8,
        'enable_comments' => false,
    ]);

    $this->actingAs(contentSettingsUserWithRole('admin'))
        ->get(route('content-settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/content-settings')
            ->where('settings.allow_public_news', true)
            ->where('settings.allow_public_events', true)
            ->where('settings.allow_public_documents', true)
            ->where('settings.homepage_featured_limit', 8)
            ->where('can.update', true));
});

test('content settings can be updated by authorized user', function () {
    $this->actingAs(contentSettingsUserWithRole('admin'))
        ->from(route('content-settings.edit'))
        ->patch(route('content-settings.update'), [
            'allow_public_news' => true,
            'allow_public_events' => false,
            'allow_public_documents' => true,
            'homepage_featured_limit' => 10,
            'enable_comments' => false,
        ])
        ->assertRedirect(route('content-settings.edit'));

    $settings = app(ContentSettings::class)->all();

    expect($settings['allow_public_news'])->toBeTrue()
        ->and($settings['allow_public_events'])->toBeFalse()
        ->and($settings['allow_public_documents'])->toBeTrue()
        ->and($settings['homepage_featured_limit'])->toBe(10)
        ->and($settings['enable_comments'])->toBeFalse();
});

test('invalid content settings are rejected', function () {
    $this->actingAs(contentSettingsUserWithRole('admin'))
        ->from(route('content-settings.edit'))
        ->patch(route('content-settings.update'), [
            'allow_public_news' => true,
            'allow_public_events' => true,
            'allow_public_documents' => true,
            'homepage_featured_limit' => 0,
            'enable_comments' => false,
        ])
        ->assertRedirect(route('content-settings.edit'))
        ->assertSessionHasErrors(['homepage_featured_limit']);
});

test('unauthorized user cannot manage content settings', function () {
    $this->actingAs(contentSettingsUserWithRole('staff'))
        ->get(route('content-settings.edit'))
        ->assertForbidden();

    $this->actingAs(contentSettingsUserWithRole('staff'))
        ->from(route('dashboard'))
        ->patch(route('content-settings.update'), [
            'allow_public_news' => true,
            'allow_public_events' => true,
            'allow_public_documents' => false,
            'homepage_featured_limit' => 6,
            'enable_comments' => false,
        ])
        ->assertForbidden();
});
