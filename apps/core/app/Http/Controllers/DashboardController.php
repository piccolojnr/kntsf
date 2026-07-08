<?php

namespace App\Http\Controllers;

use App\Support\ActivityFeed;
use App\Support\DashboardSummary;
use App\Support\ExecutiveReport;
use App\Support\ReportPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, ActivityFeed $activityFeed, DashboardSummary $dashboardSummary, ExecutiveReport $executiveReport): Response
    {
        $period = ReportPeriod::fromRequest($request);

        return Inertia::render('dashboard', [
            'filters' => $period->toArray(),
            'filterOptions' => [
                'years' => $executiveReport->years(),
                'academic_periods' => $executiveReport->academicPeriods(),
            ],
            'summary' => $dashboardSummary->counts($period),
            'reports' => $dashboardSummary->reports($period),
            'warnings' => $dashboardSummary->warnings(),
            'contentReadiness' => $dashboardSummary->contentReadiness(),
            'recentActivity' => $activityFeed->items(8),
        ]);
    }
}
