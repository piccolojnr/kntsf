<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Support\DashboardSummary;
use App\Support\ReportPeriod;
use App\Support\SimplePdfWriter;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    public function __invoke(Request $request, string $format, DashboardSummary $dashboardSummary, SimplePdfWriter $pdfWriter): Response|StreamedResponse
    {
        Gate::authorize('reports.view');

        abort_unless(in_array($format, ['pdf', 'excel', 'csv'], true), 404);

        $period = ReportPeriod::fromRequest($request);
        $reports = $dashboardSummary->reports($period);
        $summary = $dashboardSummary->counts($period);

        return match ($format) {
            'pdf' => $this->pdf($period, $summary, $reports, $pdfWriter),
            'excel' => $this->excel($period, $summary, $reports),
            default => $this->csv($period, $summary, $reports),
        };
    }

    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    private function pdf(ReportPeriod $period, array $summary, array $reports, SimplePdfWriter $pdfWriter): Response
    {
        $filename = 'kntsf-executive-report-'.$period->cacheKey().'.pdf';

        return response($pdfWriter->renderExecutiveReport(
            $period->label,
            $summary,
            $reports,
            now()->toDayDateTimeString(),
        ), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    private function excel(ReportPeriod $period, array $summary, array $reports): Response
    {
        $filename = 'kntsf-executive-report-'.$period->cacheKey().'.xls';
        $generatedAt = now()->toDayDateTimeString();
        $largestGroupTotal = max(1, ...array_values(array_map(fn (array $values): int => array_sum($values), $reports)));

        $html = view('exports.reports.executive-report-excel', [
            'period' => $period,
            'summary' => $summary,
            'reports' => $reports,
            'generatedAt' => $generatedAt,
            'largestGroupTotal' => $largestGroupTotal,
        ])->render();

        return response($html, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'max-age=0, no-cache, must-revalidate',
        ]);
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
}
