<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('users can receive permissions through roles', function () {
    $permission = Permission::findOrCreate('manage foundation', 'web');

    $role = Role::findOrCreate('admin', 'web');
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    expect($user->hasRole('admin'))->toBeTrue()
        ->and($user->can('manage foundation'))->toBeTrue();
});

test('permission middleware aliases are registered', function () {
    Route::middleware(['web', 'auth', 'permission:access foundation'])
        ->get('/_test/permission-foundation', fn () => response('ok'))
        ->name('test.permission-foundation');

    $permission = Permission::findOrCreate('access foundation', 'web');
    $role = Role::findOrCreate('admin', 'web');
    $role->givePermissionTo($permission);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/_test/permission-foundation')
        ->assertForbidden();

    $user->assignRole($role);

    $this->actingAs($user)
        ->get('/_test/permission-foundation')
        ->assertOk()
        ->assertSee('ok');
});
