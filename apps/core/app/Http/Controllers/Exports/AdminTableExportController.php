<?php

namespace App\Http\Controllers\Exports;

use App\Exports\AdminTableExport;
use App\Http\Controllers\Controller;
use App\Support\Exports\AdminTableExportRegistry;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminTableExportController extends Controller
{
    public function __invoke(Request $request, string $resource, string $format, AdminTableExportRegistry $registry): BinaryFileResponse
    {
        abort_unless(in_array($format, ['csv', 'excel'], true), 404);

        $definition = $registry->export($resource, $request);
        $extension = $format === 'excel' ? 'xlsx' : 'csv';
        $writer = $format === 'excel' ? \Maatwebsite\Excel\Excel::XLSX : \Maatwebsite\Excel\Excel::CSV;

        return Excel::download(
            new AdminTableExport($definition['title'], $definition['headings'], $definition['rows']),
            $definition['filename'].'-'.now()->format('Ymd-His').'.'.$extension,
            $writer,
        );
    }
}
