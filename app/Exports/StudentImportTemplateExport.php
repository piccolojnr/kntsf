<?php

namespace App\Exports;

use App\Support\StudentOptions;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
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
        $sheet->freezePane('A2');
        $sheet->setAutoFilter('A1:L2');
        $sheet->getStyle('A2:A1000')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

        $levels = $this->studentOptions->levelValues();

        if ($levels !== []) {
            $validation = $sheet->getCell('F2')->getDataValidation();
            $validation->setType(DataValidation::TYPE_LIST);
            $validation->setErrorStyle(DataValidation::STYLE_STOP);
            $validation->setAllowBlank(true);
            $validation->setShowErrorMessage(true);
            $validation->setShowDropDown(true);
            $validation->setErrorTitle('Invalid level');
            $validation->setError('Choose one of the levels in the dropdown.');
            $validation->setFormula1(chr(34).implode(',', $levels).chr(34));

            foreach (range(3, 1000) as $row) {
                $sheet->getCell('F'.$row)->setDataValidation(clone $validation);
            }
        }

        $sheet->getComment('A1')->getText()->createTextRun('Required. Text is recommended to preserve leading zeroes; numeric values are also accepted.');
        $sheet->getComment('F1')->getText()->createTextRun('Optional. Use 100, 200, 300, or 400. Level labels are also accepted.');

        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '17211B']],
            ],
        ];
    }
}
