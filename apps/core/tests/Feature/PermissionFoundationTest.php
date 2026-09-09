<?php

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

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

test('configured permissions and roles are seeded', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $permissions = collect(config('app-permissions.permissions'))
        ->flatten()
        ->unique()
        ->values();

    expect(Permission::query()->pluck('name')->sort()->values()->all())
        ->toBe($permissions->sort()->values()->all())
        ->and(Role::query()->pluck('name')->sort()->values()->all())
        ->toBe(['admin', 'staff', 'student', 'super_admin']);
});

test('super admin receives every configured permission', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $permissions = collect(config('app-permissions.permissions'))
        ->flatten()
        ->unique()
        ->values();

    $role = Role::findByName('super_admin');

    expect($role->permissions->pluck('name')->sort()->values()->all())
        ->toBe($permissions->sort()->values()->all());
});

test('admin receives practical foundation permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = Role::findByName('admin');

    expect($admin->hasPermissionTo('dashboard.view'))->toBeTrue()
        ->and($admin->hasPermissionTo('settings.view'))->toBeTrue()
        ->and($admin->hasPermissionTo('settings.update'))->toBeTrue()
        ->and($admin->hasPermissionTo('students.view'))->toBeTrue()
        ->and($admin->hasPermissionTo('students.create'))->toBeTrue()
        ->and($admin->hasPermissionTo('students.update'))->toBeTrue()
        ->and($admin->hasPermissionTo('students.delete'))->toBeTrue()
        ->and($admin->hasPermissionTo('students.import'))->toBeTrue()
        ->and($admin->hasPermissionTo('students.activate_account'))->toBeTrue()
        ->and($admin->hasPermissionTo('permits.view'))->toBeTrue()
        ->and($admin->hasPermissionTo('permits.issue'))->toBeTrue()
        ->and($admin->hasPermissionTo('permits.revoke'))->toBeTrue()
        ->and($admin->hasPermissionTo('payments.view'))->toBeTrue()
        ->and($admin->hasPermissionTo('payments.manage'))->toBeTrue();
});

test('staff does not receive role management permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $staff = Role::findByName('staff');

    expect($staff->hasPermissionTo('roles.view'))->toBeFalse()
        ->and($staff->hasPermissionTo('roles.manage'))->toBeFalse()
        ->and($staff->hasPermissionTo('students.view'))->toBeTrue()
        ->and($staff->hasPermissionTo('permits.issue'))->toBeTrue();
});

test('student does not receive administrative permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $student = Role::findByName('student');

    expect($student->hasPermissionTo('users.view'))->toBeFalse()
        ->and($student->hasPermissionTo('roles.manage'))->toBeFalse()
        ->and($student->hasPermissionTo('students.view'))->toBeFalse()
        ->and($student->hasPermissionTo('permits.issue'))->toBeFalse()
        ->and($student->hasPermissionTo('payments.manage'))->toBeFalse()
        ->and($student->hasPermissionTo('dashboard.view'))->toBeTrue()
        ->and($student->hasPermissionTo('settings.view'))->toBeTrue();
});
