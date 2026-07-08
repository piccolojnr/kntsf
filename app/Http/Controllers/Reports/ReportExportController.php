<?php

namespace App\Http\Controllers\Reports;

use App\Exports\ReportWorkbookExport;
use App\Http\Controllers\Controller;
use App\Support\DashboardSummary;
use App\Support\ReportPeriod;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    public function __invoke(Request $request, string $format, DashboardSummary $dashboardSummary): Response|StreamedResponse|BinaryFileResponse
    {
        Gate::authorize('reports.view');

        abort_unless(in_array($format, ['pdf', 'excel', 'csv'], true), 404);

        $period = ReportPeriod::fromRequest($request);
        $reports = $dashboardSummary->reports($period);
        $summary = $dashboardSummary->counts($period);

        return match ($format) {
            'pdf' => $this->pdf($period, $summary, $reports),
            'excel' => $this->excel($period, $summary, $reports),
            default => $this->csv($period, $summary, $reports),
        };
    }

    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    private function pdf(ReportPeriod $period, array $summary, array $reports): Response
    {
        $filename = 'kntsf-executive-report-'.$period->cacheKey().'.pdf';
        $largestGroupTotal = max(1, ...array_values(array_map(fn (array $values): int => array_sum($values), $reports)));

        return Pdf::loadView('exports.reports.executive-report-pdf', [
            'period' => $period,
            'summary' => $summary,
            'reports' => $reports,
            'generatedAt' => now()->toDayDateTimeString(),
            'largestGroupTotal' => $largestGroupTotal,
            'watchItems' => $this->watchItems($reports),
        ])
            ->setPaper('a4')
            ->download($filename);
    }

    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    private function excel(ReportPeriod $period, array $summary, array $reports): BinaryFileResponse
    {
        return Excel::download(
            new ReportWorkbookExport($period, $summary, $reports),
            'kntsf-executive-report-'.$period->cacheKey().'.xlsx',
            \Maatwebsite\Excel\Excel::XLSX,
        );
    }

    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    private function csv(ReportPeriod $period, array $summary, array $reports): StreamedResponse
    {
        $filename = 'kntsf-executive-report-'.$period->cacheKey().'.csv';

        return response()->streamDownload(function () use ($period, $summary, $reports): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['KNTSF Executive Report']);
            fputcsv($handle, ['Period', $period->label]);
            fputcsv($handle, ['Generated', now()->toDayDateTimeString()]);
            fputcsv($handle, []);
            fputcsv($handle, ['Headline', 'Value']);

            foreach ($summary as $label => $value) {
                fputcsv($handle, [str($label)->replace('_', ' ')->title()->toString(), $value]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['Group', 'Metric', 'Value']);

            foreach ($reports as $group => $values) {
                foreach ($values as $label => $value) {
                    fputcsv($handle, [
                        str($group)->replace('_', ' ')->title()->toString(),
                        str($label)->replace('_', ' ')->title()->toString(),
                        $value,
                    ]);
                }
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  array<string, array<string, int>>  $reports
     * @return array<int, array{group: string, label: string, value: int}>
     */
    private function watchItems(array $reports): array
    {
        return collect([
            ['group' => 'Students', 'label' => 'Pending setup', 'value' => $reports['students']['pending_setup'] ?? 0],
            ['group' => 'Permits', 'label' => 'Expiring soon', 'value' => $reports['permits']['expiring_soon'] ?? 0],
            ['group' => 'Payments', 'label' => 'Pending payments', 'value' => $reports['payments']['pending'] ?? 0],
            ['group' => 'Requests', 'label' => 'Paid not issued', 'value' => $reports['permit_requests']['paid_not_issued'] ?? 0],
            ['group' => 'Verification', 'label' => 'Failed checks', 'value' => $reports['verification']['failed'] ?? 0],
            ['group' => 'Elections', 'label' => 'Pending candidates', 'value' => $reports['elections']['pending_candidates'] ?? 0],
        ])
            ->sortByDesc('value')
            ->take(6)
            ->values()
            ->all();
    }
}
