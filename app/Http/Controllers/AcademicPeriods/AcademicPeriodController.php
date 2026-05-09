<?php

namespace App\Http\Controllers\AcademicPeriods;

use App\Actions\AcademicPeriods\SetActiveAcademicPeriodAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\AcademicPeriods\StoreAcademicPeriodRequest;
use App\Http\Requests\AcademicPeriods\UpdateAcademicPeriodRequest;
use App\Models\AcademicPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AcademicPeriodController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', AcademicPeriod::class);

        $periods = AcademicPeriod::query()
            ->latest('starts_at')
            ->latest()
            ->get()
            ->map(fn (AcademicPeriod $period): array => $this->periodPayload($period));

        return Inertia::render('academic-periods/index', [
            'periods' => $periods,
            'can' => [
                'manage' => $request->user()?->can('academic_periods.manage') ?? false,
            ],
        ]);
    }

    public function store(StoreAcademicPeriodRequest $request): RedirectResponse
    {
        AcademicPeriod::query()->create($request->validated());

        return to_route('academic-periods.index');
    }

    public function update(UpdateAcademicPeriodRequest $request, AcademicPeriod $academicPeriod): RedirectResponse
    {
        $academicPeriod->update($request->validated());

        return back();
    }

    public function destroy(AcademicPeriod $academicPeriod): RedirectResponse
    {
        Gate::authorize('delete', $academicPeriod);

        $academicPeriod->delete();

        return to_route('academic-periods.index');
    }

    public function setActive(
        AcademicPeriod $academicPeriod,
        SetActiveAcademicPeriodAction $setActiveAcademicPeriod
    ): RedirectResponse {
        Gate::authorize('setActive', $academicPeriod);

        $setActiveAcademicPeriod->handle($academicPeriod);

        return back();
    }

    /**
     * @return array{id: int, name: string, academic_year: string, semester: string|null, starts_at: string|null, ends_at: string|null, is_active: bool}
     */
    private function periodPayload(AcademicPeriod $period): array
    {
        return [
            'id' => $period->id,
            'name' => $period->name,
            'academic_year' => $period->academic_year,
            'semester' => $period->semester,
            'starts_at' => $period->starts_at?->toDateString(),
            'ends_at' => $period->ends_at?->toDateString(),
            'is_active' => $period->is_active,
        ];
    }
}
