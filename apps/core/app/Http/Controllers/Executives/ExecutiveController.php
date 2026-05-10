<?php

namespace App\Http\Controllers\Executives;

use App\Actions\Audit\CreateAuditLogAction;
use App\Actions\Auth\CreateAccountActivationTokenAction;
use App\Enums\AccountActivationPurpose;
use App\Http\Controllers\Controller;
use App\Http\Requests\Executives\StoreExecutiveRequest;
use App\Http\Requests\Executives\UpdateExecutiveRequest;
use App\Models\User;
use App\Notifications\Auth\SetupPasswordNotification;
use App\Support\AuditEvents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ExecutiveController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = $request->string('search')->trim()->toString();

        $executives = User::query()
            ->with(['roles:id,name', 'executiveProfile'])
            ->whereDoesntHave('roles', fn (Builder $query) => $query->where('name', 'student'))
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('executiveProfile', function (Builder $query) use ($search) {
                            $query->where('position', 'like', "%{$search}%")
                                ->orWhere('category', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $executive): array => $this->payload($executive));

        return Inertia::render('executives/index', [
            'executives' => $executives,
            'filters' => [
                'search' => $search,
            ],
            'options' => [
                'roles' => $this->assignableRoles($request->user()),
            ],
            'can' => [
                'create' => $request->user()?->can('create', User::class) ?? false,
                'update' => $request->user()?->can('executives.update') ?? false,
                'delete' => $request->user()?->can('executives.delete') ?? false,
                'activate' => $request->user()?->can('executives.activate') ?? false,
            ],
        ]);
    }

    public function store(
        StoreExecutiveRequest $request,
        CreateAuditLogAction $createAuditLog,
        CreateAccountActivationTokenAction $createToken,
    ): RedirectResponse {
        $executive = DB::transaction(function () use ($request, $createAuditLog, $createToken): User {
            $executive = User::query()->create([
                'name' => $request->validated('name'),
                'email' => mb_strtolower((string) $request->validated('email')),
                'password' => null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $executive->syncRoles($request->validated('roles'));
            $this->updateProfile($executive, $request->validated());

            $createAuditLog->handle(
                actor: $request->user(),
                event: AuditEvents::ExecutiveCreated,
                auditable: $executive,
                subject: $executive,
                description: 'Executive user created.',
                newValues: $this->auditValues($executive->refresh()->load(['roles', 'executiveProfile'])),
                request: $request,
            );

            if ($request->boolean('send_setup_link')) {
                $this->issueSetupLink($executive, $createToken);

                $createAuditLog->handle(
                    actor: $request->user(),
                    event: AuditEvents::ExecutiveSetupLinkSent,
                    auditable: $executive,
                    subject: $executive,
                    description: 'Executive setup-password link sent.',
                    request: $request,
                );
            }

            return $executive;
        });

        return to_route('executives.show', $executive);
    }

    public function show(Request $request, User $executive): Response
    {
        Gate::authorize('view', $executive);

        return Inertia::render('executives/show', [
            'executive' => $this->payload($executive->load(['roles:id,name', 'executiveProfile'])),
            'options' => [
                'roles' => $this->assignableRoles($request->user()),
            ],
            'can' => [
                'update' => $request->user()?->can('update', $executive) ?? false,
                'delete' => $request->user()?->can('delete', $executive) ?? false,
                'activate' => $request->user()?->can('activate', $executive) ?? false,
                'deactivate' => $request->user()?->can('deactivate', $executive) ?? false,
                'sendSetupLink' => $request->user()?->can('sendSetupLink', $executive) ?? false,
            ],
        ]);
    }

    public function update(UpdateExecutiveRequest $request, User $executive, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        $oldValues = $this->auditValues($executive->load(['roles', 'executiveProfile']));

        DB::transaction(function () use ($request, $executive): void {
            $executive->update([
                'name' => $request->validated('name'),
                'email' => mb_strtolower((string) $request->validated('email')),
                'is_active' => $request->boolean('is_active', true),
            ]);

            $executive->syncRoles($request->validated('roles'));
            $this->updateProfile($executive, $request->validated());
        });

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::ExecutiveDeleted,
            auditable: $executive,
            subject: $executive,
            description: 'Executive user updated.',
            oldValues: $oldValues,
            newValues: $this->auditValues($executive->refresh()->load(['roles', 'executiveProfile'])),
            request: $request,
        );

        return back();
    }

    public function destroy(Request $request, User $executive, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('delete', $executive);

        $oldValues = $this->auditValues($executive->load(['roles', 'executiveProfile']));

        $executive->delete();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::ExecutiveUpdated,
            auditable: $executive,
            subject: $executive,
            description: 'Executive user deleted.',
            oldValues: $oldValues,
            request: $request,
        );

        return to_route('executives.index');
    }

    public function activate(Request $request, User $executive, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('activate', $executive);

        $executive->forceFill(['is_active' => true])->save();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::ExecutiveActivated,
            auditable: $executive,
            subject: $executive,
            description: 'Executive user activated.',
            newValues: ['is_active' => true],
            request: $request,
        );

        return back();
    }

    public function deactivate(Request $request, User $executive, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        Gate::authorize('deactivate', $executive);

        $executive->forceFill(['is_active' => false])->save();

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::ExecutiveDeactivated,
            auditable: $executive,
            subject: $executive,
            description: 'Executive user deactivated.',
            oldValues: ['is_active' => true],
            newValues: ['is_active' => false],
            request: $request,
        );

        return back();
    }

    public function sendSetupLink(
        Request $request,
        User $executive,
        CreateAccountActivationTokenAction $createToken,
        CreateAuditLogAction $createAuditLog,
    ): RedirectResponse {
        Gate::authorize('sendSetupLink', $executive);

        $this->issueSetupLink($executive, $createToken);

        $createAuditLog->handle(
            actor: $request->user(),
            event: AuditEvents::ExecutiveSetupLinkSent,
            auditable: $executive,
            subject: $executive,
            description: 'Executive setup-password link sent.',
            request: $request,
        );

        return back();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function updateProfile(User $executive, array $attributes): void
    {
        $executive->executiveProfile()->updateOrCreate([], [
            'position' => $attributes['position'] ?? null,
            'position_description' => $attributes['position_description'] ?? null,
            'biography' => $attributes['biography'] ?? null,
            'category' => $attributes['category'] ?? null,
            'sort_order' => $attributes['sort_order'] ?? 0,
            'is_published' => (bool) ($attributes['is_published'] ?? true),
            'social_links' => [],
        ]);
    }

    private function issueSetupLink(User $executive, CreateAccountActivationTokenAction $createToken): void
    {
        $tokenData = $createToken->handle($executive, AccountActivationPurpose::SetupPassword);

        $executive->notify(new SetupPasswordNotification($tokenData['token']));
    }

    /**
     * @return array<int, array{name: string, label: string}>
     */
    private function assignableRoles(?User $actor): array
    {
        return Role::query()
            ->where('name', '!=', 'student')
            ->when(! $actor?->hasRole('super_admin'), fn ($query) => $query->where('name', '!=', 'super_admin'))
            ->orderBy('name')
            ->get(['name'])
            ->map(fn (Role $role): array => [
                'name' => $role->name,
                'label' => str($role->name)->replace('_', ' ')->title()->toString(),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(User $executive): array
    {
        return [
            'id' => $executive->id,
            'name' => $executive->name,
            'email' => $executive->email,
            'is_active' => $executive->is_active,
            'created_at' => $executive->created_at?->toISOString(),
            'roles' => $executive->roles->map(fn (Role $role): array => [
                'name' => $role->name,
                'label' => str($role->name)->replace('_', ' ')->title()->toString(),
            ])->values()->all(),
            'profile' => $executive->executiveProfile === null ? null : [
                'position' => $executive->executiveProfile->position,
                'position_description' => $executive->executiveProfile->position_description,
                'biography' => $executive->executiveProfile->biography,
                'category' => $executive->executiveProfile->category,
                'sort_order' => $executive->executiveProfile->sort_order,
                'is_published' => $executive->executiveProfile->is_published,
                'social_links' => $executive->executiveProfile->social_links,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function auditValues(User $executive): array
    {
        return [
            'name' => $executive->name,
            'email' => $executive->email,
            'is_active' => $executive->is_active,
            'roles' => $executive->roles->pluck('name')->values()->all(),
            'profile' => $executive->executiveProfile?->only([
                'position',
                'position_description',
                'biography',
                'category',
                'sort_order',
                'is_published',
            ]),
        ];
    }
}
