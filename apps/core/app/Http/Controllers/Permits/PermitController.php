<?php

namespace App\Http\Controllers\Permits;

use App\Actions\Permits\IssuePermitAction;
use App\Actions\Permits\MarkPermitCardDeliveredAction;
use App\Actions\Permits\RevokePermitAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Permits\RevokePermitRequest;
use App\Http\Requests\Permits\StorePermitRequest;
use App\Models\AcademicPeriod;
use App\Models\Permit;
use App\Models\Student;
use App\Support\ActiveAcademicPeriod;
use App\Support\PermitSettings;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PermitController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Permit::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $permits = Permit::query()
            ->with([
                'student:id,student_number,name,email,course,level',
                'academicPeriod:id,name,academic_year,semester',
                'issuedBy:id,name,email',
                'revokedBy:id,name,email',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where('code_last4', 'like', "%{$search}%")
                    ->orWhereHas('student', function (Builder $query) use ($search) {
                        $query->where('student_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Permit $permit): array => $this->permitPayload($permit));

        return Inertia::render('permits/index', [
            'permits' => $permits,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'options' => $this->formOptions(),
            'overview' => [
                'total' => Permit::query()->count(),
                'active' => Permit::query()->where('status', 'active')->count(),
                'revoked' => Permit::query()->where('status', 'revoked')->count(),
            ],
            'issuedPermitCode' => $request->session()->get('issuedPermitCode'),
            'can' => [
                'issue' => $request->user()?->can('permits.issue') ?? false,
                'revoke' => $request->user()?->can('permits.revoke') ?? false,
                'markCardDelivered' => $request->user()?->can('permits.issue') ?? false,
                'delete' => $request->user()?->can('permits.revoke') ?? false,
            ],
        ]);
    }

    public function store(StorePermitRequest $request, IssuePermitAction $issuePermit): RedirectResponse
    {
        try {
            $issuedPermit = $issuePermit->handle(
                Student::query()->findOrFail($request->integer('student_id')),
                $request->user(),
                $request->validated()
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['permit' => $exception->getMessage()]);
        }

        return to_route('permits.show', $issuedPermit->permit)
            ->with('issuedPermitCode', $issuedPermit->code);
    }

    public function show(Request $request, Permit $permit): Response
    {
        Gate::authorize('view', $permit);

        return Inertia::render('permits/show', [
            'permit' => $this->permitPayload($permit->load([
                'student:id,student_number,name,email,course,level',
                'academicPeriod:id,name,academic_year,semester',
                'issuedBy:id,name,email',
                'revokedBy:id,name,email',
            ])),
            'issuedPermitCode' => $request->session()->get('issuedPermitCode'),
            'can' => [
                'revoke' => $request->user()?->can('revoke', $permit) ?? false,
                'markCardDelivered' => $request->user()?->can('markCardDelivered', $permit) ?? false,
                'delete' => $request->user()?->can('delete', $permit) ?? false,
            ],
        ]);
    }

    public function revoke(
        RevokePermitRequest $request,
        Permit $permit,
        RevokePermitAction $revokePermit
    ): RedirectResponse {
        try {
            $revokePermit->handle(
                $permit,
                $request->user(),
                $request->validated('revocation_reason')
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['permit' => $exception->getMessage()]);
        }

        return back();
    }

    public function markCardDelivered(
        Request $request,
        Permit $permit,
        MarkPermitCardDeliveredAction $markPermitCardDelivered
    ): RedirectResponse {
        Gate::authorize('markCardDelivered', $permit);

        $markPermitCardDelivered->handle($permit, $request->user());

        return back();
    }

    public function destroy(Permit $permit): RedirectResponse
    {
        Gate::authorize('delete', $permit);

        $permit->delete();

        return to_route('permits.index');
    }

    private function permitPayload(Permit $permit): array
    {
        return [
            'id' => $permit->id,
            'code_last4' => $permit->code_last4,
            'status' => $permit->status->value,
            'status_label' => str($permit->status->value)->replace('_', ' ')->title()->toString(),
            'starts_at' => $permit->starts_at?->toISOString(),
            'expires_at' => $permit->expires_at?->toISOString(),
            'amount_paid' => (string) $permit->amount_paid,
            'currency' => $permit->currency,
            'card_delivered_at' => $permit->card_delivered_at?->toISOString(),
            'revoked_at' => $permit->revoked_at?->toISOString(),
            'revocation_reason' => $permit->revocation_reason,
            'student' => [
                'id' => $permit->student->id,
                'student_number' => $permit->student->student_number,
                'name' => $permit->student->name,
                'email' => $permit->student->email,
                'course' => $permit->student->course,
                'level' => $permit->student->level,
            ],
            'academic_period' => $permit->academicPeriod === null ? null : [
                'id' => $permit->academicPeriod->id,
                'name' => $permit->academicPeriod->name,
                'academic_year' => $permit->academicPeriod->academic_year,
                'semester' => $permit->academicPeriod->semester,
            ],
            'issued_by' => $permit->issuedBy === null ? null : [
                'id' => $permit->issuedBy->id,
                'name' => $permit->issuedBy->name,
                'email' => $permit->issuedBy->email,
            ],
            'revoked_by' => $permit->revokedBy === null ? null : [
                'id' => $permit->revokedBy->id,
                'name' => $permit->revokedBy->name,
                'email' => $permit->revokedBy->email,
            ],
        ];
    }

    private function formOptions(): array
    {
        $settings = app(PermitSettings::class)->all();
        $activeAcademicPeriod = app(ActiveAcademicPeriod::class)->get();
        $startsAt = $this->defaultStartsAt($activeAcademicPeriod);
        $expiresAt = $this->defaultExpiresAt($activeAcademicPeriod, $startsAt, $settings['default_validity_days']);

        return [
            'students' => Student::query()
                ->orderBy('student_number')
                ->get(['id', 'student_number', 'name', 'email'])
                ->map(fn (Student $student): array => [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'email' => $student->email,
                    'label' => trim($student->student_number.' - '.($student->name ?? 'Unnamed student')),
                ])
                ->values()
                ->all(),
            'academic_periods' => AcademicPeriod::query()
                ->latest('is_active')
                ->latest('starts_at')
                ->get(['id', 'name', 'academic_year', 'semester', 'is_active'])
                ->map(fn (AcademicPeriod $period): array => [
                    'id' => $period->id,
                    'label' => trim($period->name.' - '.$period->academic_year.($period->semester ? ' '.$period->semester : '')),
                    'is_active' => $period->is($activeAcademicPeriod),
                ])
                ->values()
                ->all(),
            'issue_defaults' => [
                'amount_paid' => $settings['default_amount'],
                'currency' => $settings['currency'],
                'starts_at' => $this->datetimeLocalValue($startsAt),
                'expires_at' => $this->datetimeLocalValue($expiresAt),
            ],
        ];
    }

    private function datetimeLocalValue(CarbonInterface $date): string
    {
        return $date->format('Y-m-d\TH:i');
    }

    private function defaultStartsAt(?AcademicPeriod $academicPeriod): CarbonInterface
    {
        if ($academicPeriod?->starts_at instanceof CarbonInterface && $academicPeriod->starts_at->isFuture()) {
            return $academicPeriod->starts_at->startOfDay();
        }

        return now();
    }

    private function defaultExpiresAt(?AcademicPeriod $academicPeriod, CarbonInterface $startsAt, int $defaultValidityDays): CarbonInterface
    {
        if ($academicPeriod?->ends_at instanceof CarbonInterface) {
            return $academicPeriod->ends_at->endOfDay();
        }

        return $startsAt->copy()->addDays($defaultValidityDays);
    }
}
