<?php

use App\Models\User;
use App\Support\PermitSettings;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function permitSettingsUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('permit settings can be read by authorized user', function () {
    $this->actingAs(permitSettingsUserWithRole('admin'))
        ->get(route('permit-settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/permit-settings')
            ->where('settings.currency', 'GHS')
            ->where('settings.default_validity_days', 120)
            ->where('can.update', true));
});

test('permit settings can be updated by authorized user', function () {
    $this->actingAs(permitSettingsUserWithRole('admin'))
        ->from(route('permit-settings.edit'))
        ->patch(route('permit-settings.update'), [
            'default_amount' => '45.50',
            'currency' => 'ghs',
            'default_validity_days' => 90,
            'permit_requests_enabled' => true,
        ])
        ->assertRedirect(route('permit-settings.edit'));

    $settings = app(PermitSettings::class)->all();

    expect($settings['default_amount'])->toBe(45.5)
        ->and($settings['currency'])->toBe('GHS')
        ->and($settings['default_validity_days'])->toBe(90)
        ->and($settings['permit_requests_enabled'])->toBeTrue();
});

test('invalid permit setting values are rejected', function () {
    $this->actingAs(permitSettingsUserWithRole('admin'))
        ->from(route('permit-settings.edit'))
        ->patch(route('permit-settings.update'), [
            'default_amount' => -1,
            'currency' => 'GHSS',
            'default_validity_days' => 0,
            'permit_requests_enabled' => true,
        ])
        ->assertRedirect(route('permit-settings.edit'))
        ->assertSessionHasErrors([
            'default_amount',
            'currency',
            'default_validity_days',
        ]);
});

test('unauthorized user cannot update permit settings', function () {
    $this->actingAs(permitSettingsUserWithRole('staff'))
        ->from(route('permit-settings.edit'))
        ->patch(route('permit-settings.update'), [
            'default_amount' => 20,
            'currency' => 'GHS',
            'default_validity_days' => 120,
            'permit_requests_enabled' => false,
        ])
        ->assertForbidden();
});
