<?php

namespace App\Imports;

use App\Models\Student;
use App\Support\StudentOptions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class StudentImportPreviewer
{
    private const Columns = [
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

    public function __construct(private readonly StudentOptions $studentOptions) {}

    /**
     * @return array{valid: array<int, array<string, mixed>>, errors: array<int, array{row: int, messages: array<int, string>}>, summary: array{total: int, valid: int, failed: int, creates: int, updates: int}}
     */
    public function preview(UploadedFile $file): array
    {
        $import = new StudentRowsImport;
        Excel::import($import, $file);
        $seenStudentNumbers = [];
        $seenEmails = [];
        $valid = [];
        $errors = [];

        foreach ($import->rows()->values() as $index => $row) {
            $rowNumber = $index + 2;
            $normalized = $this->normalize($row);
            $validator = Validator::make($normalized, $this->rules());

            if ($validator->passes() && $normalized['student_number'] !== null) {
                $key = mb_strtolower($normalized['student_number']);

                if (isset($seenStudentNumbers[$key])) {
                    $validator->errors()->add('student_number', 'Duplicate student number in import file.');
                }

                $seenStudentNumbers[$key] = true;
            }

            if ($validator->passes() && $normalized['email'] !== null) {
                $key = mb_strtolower($normalized['email']);

                if (isset($seenEmails[$key])) {
                    $validator->errors()->add('email', 'Duplicate email in import file.');
                }

                $seenEmails[$key] = true;
            }

            if ($validator->fails()) {
                $errors[] = [
                    'row' => $rowNumber,
                    'messages' => $validator->errors()->all(),
                ];

                continue;
            }

            $match = $this->matchingStudent($normalized);
            $valid[] = [
                'row' => $rowNumber,
                'action' => $match === null ? 'create' : 'update',
                'match_by' => $match?->student_number === $normalized['student_number'] ? 'student_number' : ($match === null ? null : 'email'),
                'student' => $normalized,
            ];
        }

        return [
            'valid' => $valid,
            'errors' => $errors,
            'summary' => [
                'total' => $import->rows()->count(),
                'valid' => count($valid),
                'failed' => count($errors),
                'creates' => collect($valid)->where('action', 'create')->count(),
                'updates' => collect($valid)->where('action', 'update')->count(),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>|Collection<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function normalize(array|Collection $row): array
    {
        $row = collect($row);

        return collect(self::Columns)
            ->mapWithKeys(fn (string $column): array => [
                $column => match ($column) {
                    'student_number' => $this->normalizeStudentNumber($row->get($column)),
                    'level' => $this->normalizeLevel($row->get($column)),
                    default => $this->clean($row->get($column)),
                },
            ])
            ->all();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'student_number' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'course' => ['nullable', 'string', 'max:255', Rule::in($this->studentOptions->courseValues())],
            'level' => ['nullable', 'string', 'max:100', Rule::in($this->studentOptions->levelValues())],
            'department' => ['nullable', 'string', 'max:255'],
            'programme' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:50'],
            'campus' => ['nullable', 'string', 'max:255'],
            'entry_year' => ['nullable', 'integer', 'digits:4'],
            'status' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function matchingStudent(array $row): ?Student
    {
        $student = Student::query()
            ->where('student_number', $row['student_number'])
            ->first();

        if ($student instanceof Student || blank($row['email'])) {
            return $student;
        }

        return Student::query()
            ->where('email', $row['email'])
            ->first();
    }

    private function clean(mixed $value): mixed
    {
        if (is_string($value)) {
            $value = trim($value);

            return $value === '' ? null : $value;
        }

        return $value === '' ? null : $value;
    }

    private function normalizeStudentNumber(mixed $value): ?string
    {
        if (is_int($value)) {
            return (string) $value;
        }

        if (is_float($value) && is_finite($value) && floor($value) === $value) {
            return number_format($value, 0, '.', '');
        }

        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function normalizeLevel(mixed $value): ?string
    {
        if (is_int($value)) {
            return (string) $value;
        }

        if (is_float($value) && is_finite($value) && floor($value) === $value) {
            return number_format($value, 0, '.', '');
        }

        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        if ($value === '') {
            return null;
        }

        if (preg_match('/^(?:level\s*)?(\d+)(?:\s*level)?$/i', $value, $matches) === 1) {
            return $matches[1];
        }

        return $value;
    }
}
