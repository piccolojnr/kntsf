<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AdminTableExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  array<int, string>  $headings
     * @param  Collection<int, array<int, mixed>>  $rows
     */
    public function __construct(
        private readonly string $title,
        private readonly array $headings,
        private readonly Collection $rows,
    ) {}

    public function collection(): Collection
    {
        return $this->rows;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return $this->headings;
    }

    public function title(): string
    {
        return $this->title;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => '17211B'],
                ],
            ],
        ];
    }
}
