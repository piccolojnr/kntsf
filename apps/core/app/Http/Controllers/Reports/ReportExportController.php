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

        abort_unless(in_array($format, ['pdf', 'csv'], true), 404);

        $period = ReportPeriod::fromRequest($request);
        $reports = $dashboardSummary->reports($period);
        $summary = $dashboardSummary->counts($period);

        return $format === 'pdf'
            ? $this->pdf($period, $summary, $reports, $pdfWriter)
            : $this->csv($period, $summary, $reports);
    }

    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    private function pdf(ReportPeriod $period, array $summary, array $reports, SimplePdfWriter $pdfWriter): Response
    {
        $lines = [
            'KNTSF Executive Report',
            'Period: '.$period->label,
            'Generated: '.now()->toDayDateTimeString(),
            '',
            'Headline',
            'Students: '.$summary['total_students'],
            'Active permits: '.$summary['active_permits'],
            'Successful payments: '.$summary['successful_payments'],
            'Verification attempts: '.$summary['verification_attempts'],
            'Election votes: '.$summary['election_votes'],
            '',
            'Detailed report groups',
        ];

        foreach ($reports as $group => $values) {
            $lines[] = '';
            $lines[] = str($group)->replace('_', ' ')->title()->toString();

            foreach ($values as $label => $value) {
                $lines[] = '  '.str($label)->replace('_', ' ')->title()->toString().': '.$value;
            }
        }

        $filename = 'kntsf-executive-report-'.$period->cacheKey().'.pdf';

        return response($pdfWriter->render($lines), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
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
