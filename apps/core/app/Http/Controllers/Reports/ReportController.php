<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Support\DashboardSummary;
use App\Support\ExecutiveReport;
use App\Support\ReportPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(Request $request, DashboardSummary $dashboardSummary, ExecutiveReport $executiveReport): Response
    {
        Gate::authorize('reports.view');

        $period = ReportPeriod::fromRequest($request);

        return Inertia::render('reports/index', [
            'filters' => $period->toArray(),
            'filterOptions' => [
                'years' => $executiveReport->years(),
                'academic_periods' => $executiveReport->academicPeriods(),
            ],
            'reports' => $dashboardSummary->reports($period),
            'summary' => $dashboardSummary->counts($period),
        ]);
    }
}
