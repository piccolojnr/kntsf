<?php

namespace App\Http\Controllers\Roles;

use App\Actions\Audit\CreateAuditLogAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Support\AuditEvents;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    private const ProtectedRoles = ['super_admin', 'admin', 'staff', 'student'];

    public function index(Request $request): Response
    {
        Gate::authorize('roles.view');

        $roles = Role::query()
            ->withCount('users')
            ->with('permissions:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role): array => $this->payload($role))
            ->values()
            ->all();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissionGroups' => $this->permissionGroups(),
            'can' => [
                'manage' => $request->user()?->can('roles.manage') ?? false,
            ],
            'protectedRoles' => self::ProtectedRoles,
        ]);
    }

    public function store(StoreRoleRequest $request, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        $role = Role::query()->create([
            'name' => $request->validated('name'),
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($request->validated('permissions', []));

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::RoleCreated,
            auditable: $role,
            subject: $role,
            description: 'Role created.',
            newValues: [
                'name' => $role->name,
                'permissions' => $role->permissions()->pluck('name')->all(),
            ],
            request: $request,
        );

        return to_route('roles.show', $role);
    }

    public function show(Request $request, Role $role): Response
    {
        Gate::authorize('roles.view');

        $role->load('permissions:id,name')->loadCount('users');

        return Inertia::render('roles/show', [
            'role' => $this->payload($role),
            'permissionGroups' => $this->permissionGroups(),
            'can' => [
                'manage' => $request->user()?->can('roles.manage') ?? false,
                'delete' => $request->user()?->can('roles.manage') && ! $this->isProtected($role),
            ],
            'protectedRoles' => self::ProtectedRoles,
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        $oldValues = [
            'name' => $role->name,
            'permissions' => $role->permissions()->pluck('name')->sort()->values()->all(),
        ];

        if ($this->isProtected($role) && $request->validated('name') !== $role->name) {
            return back()->withErrors(['name' => 'Protected role names cannot be changed.']);
        }

        $role->update([
            'name' => $request->validated('name'),
        ]);

        $role->syncPermissions($request->validated('permissions', []));

        $newValues = [
            'name' => $role->name,
            'permissions' => $role->permissions()->pluck('name')->sort()->values()->all(),
        ];

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::RoleUpdated,
            auditable: $role,
            subject: $role,
            description: 'Role updated.',
            oldValues: $oldValues,
            newValues: $newValues,
            request: $request,
        );

        if ($oldValues['permissions'] !== $newValues['permissions']) {
            $createAuditLog->handle(
                actor: $request->user(),
                event: AuditEvents::RolePermissionsChanged,
                auditable: $role,
                subject: $role,
                description: 'Role permissions changed.',
                oldValues: ['permissions' => $oldValues['permissions']],
                newValues: ['permissions' => $newValues['permissions']],
                request: $request,
            );
        }

        return back();
    }

    public function destroy(Request $request, Role $role, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('roles.manage');

        if ($this->isProtected($role)) {
            return back()->withErrors(['role' => 'Protected roles cannot be deleted.']);
        }

        $oldValues = [
            'name' => $role->name,
            'permissions' => $role->permissions()->pluck('name')->sort()->values()->all(),
        ];

        $role->delete();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::RoleDeleted,
            description: 'Role deleted.',
            oldValues: $oldValues,
            request: $request,
        );

        return to_route('roles.index');
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function permissionGroups(): array
    {
        return collect(config('app-permissions.permissions', []))
            ->map(fn (array $permissions): array => array_values($permissions))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'label' => str($role->name)->replace('_', ' ')->title()->toString(),
            'users_count' => $role->users_count ?? $role->users()->count(),
            'permissions' => $role->permissions->pluck('name')->sort()->values()->all(),
            'is_protected' => $this->isProtected($role),
        ];
    }

    private function isProtected(Role $role): bool
    {
        return in_array($role->name, self::ProtectedRoles, true);
    }
}
