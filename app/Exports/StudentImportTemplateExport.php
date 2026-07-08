<?php

namespace App\Exports;

use App\Support\StudentOptions;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentImportTemplateExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    public function __construct(private readonly StudentOptions $studentOptions) {}

    public function collection(): Collection
    {
        $course = $this->studentOptions->courseValues()[0] ?? 'Computer Science';
        $level = $this->studentOptions->levelValues()[0] ?? '100';

        return collect([
            ['261012345', 'Ama Serwaa Mensah', 'ama.mensah@example.edu', '+233 24 000 1234', $course, $level, 'Business School', 'BSc '.$course, 'Female', 'Main Campus', now()->year - 1, 'active'],
        ]);
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'student_number',
            'name',
            'email',
            'phone',
            'course',
            'level',
            'department',
            'programme',
            'gender',
            'campus',
            'entry_year',
            'status',
        ];
    }

    public function title(): string
    {
        return 'Students';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '17211B']],
            ],
        ];
    }
}
