<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = $this->permissions();

        $permissions->each(
            fn (string $permission) => Permission::findOrCreate($permission, 'web')
        );

        $roles = config('app-permissions.roles', []);

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');

            $role->syncPermissions(
                $rolePermissions === ['*'] ? $permissions->all() : $rolePermissions
            );
        }

        $this->createLocalSuperAdmin();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * @return Collection<int, string>
     */
    private function permissions(): Collection
    {
        return collect(config('app-permissions.permissions', []))
            ->flatten()
            ->unique()
            ->values();
    }

    private function createLocalSuperAdmin(): void
    {
        $credentials = config('app-permissions.super_admin');

        if (User::query()->exists() || ! $this->hasCompleteSuperAdminCredentials($credentials)) {
            return;
        }

        $user = User::query()->create([
            'name' => $credentials['name'],
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ]);

        $user->assignRole('super_admin');
    }

    /**
     * @param  array{name?: string|null, email?: string|null, password?: string|null}  $credentials
     */
    private function hasCompleteSuperAdminCredentials(array $credentials): bool
    {
        return collect(['name', 'email', 'password'])
            ->every(fn (string $key): bool => filled($credentials[$key] ?? null));
    }
}
