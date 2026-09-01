<?php

namespace App\Exports;

use App\Support\ReportPeriod;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReportWorkbookExport implements FromCollection, ShouldAutoSize, WithStyles, WithTitle
{
    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    public function __construct(
        private readonly ReportPeriod $period,
        private readonly array $summary,
        private readonly array $reports,
    ) {
    }

    public function collection(): Collection
    {
        $rows = collect([
            ['KUC Executive Report', '', ''],
            ['Period', $this->period->label, ''],
            ['Generated', now()->toDayDateTimeString(), ''],
            ['', '', ''],
            ['KPI', 'Value', 'Section'],
        ]);

        foreach ($this->summary as $label => $value) {
            $rows->push([$this->label($label), $value, 'Summary']);
        }

        $rows->push(['', '', '']);
        $rows->push(['Module', 'Metric', 'Value']);

        foreach ($this->reports as $group => $values) {
            foreach ($values as $label => $value) {
                $rows->push([$this->label($group), $this->label($label), $value]);
            }
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Executive Report';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        $sheet->mergeCells('A1:C1');

        return [
            1 => ['font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '17211B']]],
            5 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '442E66']]],
            count($this->summary) + 7 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '17211B']]],
        ];
    }

    private function label(string $value): string
    {
        return str($value)->replace('_', ' ')->title()->toString();
    }
}
