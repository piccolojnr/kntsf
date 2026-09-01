<?php

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function (): void {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function studentWebAccessUser(string $role): User
{
    $user = User::factory()->create([
        'password' => Hash::make('Password123!'),
    ]);
    $user->assignRole($role);

    return $user;
}

test('mobile app handoff page can be rendered', function () {
    $this->get(route('account.mobile-app'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/mobile-app'));
});

test('student only users are redirected from dashboard to mobile handoff page', function () {
    $this->actingAs(studentWebAccessUser('student'))
        ->get(route('dashboard'))
        ->assertRedirect(route('account.mobile-app'));
});

test('student only users cannot access dashboard modules directly', function () {
    $this->actingAs(studentWebAccessUser('student'))
        ->get(route('students.index'))
        ->assertForbidden();
});

test('student login redirects to mobile handoff page', function () {
    $user = studentWebAccessUser('student');

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'Password123!',
    ])->assertRedirect(route('account.mobile-app', absolute: false));

    $this->assertAuthenticatedAs($user);
});

test('staff login still redirects to dashboard', function () {
    $user = studentWebAccessUser('staff');

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'Password123!',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
});
