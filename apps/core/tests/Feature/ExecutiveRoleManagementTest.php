<?php

use App\Models\AccountActivationToken;
use App\Models\ExecutiveProfile;
use App\Models\User;
use App\Notifications\Auth\SetupPasswordNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function managementUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('admin can create executive user', function () {
    $admin = managementUserWithRole('admin');

    $this->actingAs($admin)
        ->post(route('executives.store'), [
            'name' => 'SRC Secretary',
            'email' => 'secretary@example.com',
            'roles' => ['staff'],
            'is_active' => '1',
            'position' => 'Secretary',
            'category' => 'SRC Executive',
        ])
        ->assertRedirect();

    $executive = User::query()->where('email', 'secretary@example.com')->firstOrFail();

    expect($executive->password)->toBeNull()
        ->and($executive->is_active)->toBeTrue()
        ->and($executive->hasRole('staff'))->toBeTrue()
        ->and($executive->executiveProfile)->toBeInstanceOf(ExecutiveProfile::class)
        ->and($executive->executiveProfile->position)->toBe('Secretary');
});

test('executive user gets selected role', function () {
    $this->actingAs(managementUserWithRole('admin'))
        ->post(route('executives.store'), [
            'name' => 'Finance Officer',
            'email' => 'finance@example.com',
            'roles' => ['admin'],
        ])
        ->assertRedirect();

    expect(User::query()->where('email', 'finance@example.com')->firstOrFail()->hasRole('admin'))->toBeTrue();
});

test('setup link can be sent', function () {
    Notification::fake();

    $executive = User::factory()->create(['password' => null]);
    $executive->assignRole('staff');

    $this->actingAs(managementUserWithRole('admin'))
        ->post(route('executives.send-setup-link', $executive))
        ->assertRedirect();

    expect(AccountActivationToken::query()->where('user_id', $executive->id)->count())->toBe(1);
    Notification::assertSentTo($executive, SetupPasswordNotification::class);
});

test('admin cannot deactivate self', function () {
    $admin = managementUserWithRole('admin');

    $this->actingAs($admin)
        ->post(route('executives.deactivate', $admin))
        ->assertForbidden();

    expect($admin->refresh()->is_active)->toBeTrue();
});

test('staff cannot access executive management', function () {
    $this->actingAs(managementUserWithRole('staff'))
        ->get(route('executives.index'))
        ->assertForbidden();
});

test('student cannot access executive management', function () {
    $this->actingAs(managementUserWithRole('student'))
        ->get(route('executives.index'))
        ->assertForbidden();
});

test('role page requires permission', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('roles.index'))
        ->assertForbidden();
});

test('protected roles cannot be deleted', function () {
    $adminRole = Role::findByName('admin');

    $this->actingAs(managementUserWithRole('admin'))
        ->from(route('roles.index'))
        ->delete(route('roles.destroy', $adminRole))
        ->assertRedirect(route('roles.index'))
        ->assertSessionHasErrors('role');

    expect(Role::query()->where('name', 'admin')->exists())->toBeTrue();
});

test('permissions can be assigned to custom role', function () {
    $this->actingAs(managementUserWithRole('admin'))
        ->post(route('roles.store'), [
            'name' => 'operations_lead',
            'permissions' => ['students.view', 'permits.view'],
        ])
        ->assertRedirect();

    $role = Role::findByName('operations_lead');

    expect($role->hasPermissionTo('students.view'))->toBeTrue()
        ->and($role->hasPermissionTo('permits.view'))->toBeTrue();
});

test('non super admin cannot modify super admin user', function () {
    $superAdmin = managementUserWithRole('super_admin');

    $this->actingAs(managementUserWithRole('admin'))
        ->patch(route('executives.update', $superAdmin), [
            'name' => 'Changed Name',
            'email' => $superAdmin->email,
            'roles' => ['admin'],
        ])
        ->assertForbidden();

    expect($superAdmin->refresh()->name)->not->toBe('Changed Name')
        ->and($superAdmin->hasRole('super_admin'))->toBeTrue();
});
