<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Support\DashboardSummary;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(DashboardSummary $dashboardSummary): Response
    {
        Gate::authorize('reports.view');

        return Inertia::render('reports/index', [
            'reports' => $dashboardSummary->reports(),
            'summary' => $dashboardSummary->counts(),
        ]);
    }
}
