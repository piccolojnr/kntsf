<?php

namespace App\Http\Controllers\Students;

use App\Actions\Audit\CreateAuditLogAction;
use App\Exports\StudentImportTemplateExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Students\CommitStudentImportRequest;
use App\Http\Requests\Students\PreviewStudentImportRequest;
use App\Imports\StudentImportPreviewer;
use App\Models\Student;
use App\Support\AuditEvents;
use App\Support\StudentOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StudentImportController extends Controller
{
    public function show(Request $request): Response
    {
        Gate::authorize('import', Student::class);

        return Inertia::render('students/import', [
            'result' => $request->session()->get('studentImportResult'),
        ]);
    }

    public function template(StudentOptions $studentOptions): BinaryFileResponse
    {
        Gate::authorize('import', Student::class);

        return Excel::download(
            new StudentImportTemplateExport($studentOptions),
            'student-import-template.xlsx',
        );
    }

    public function preview(PreviewStudentImportRequest $request, StudentImportPreviewer $previewer): Response
    {
        $preview = $previewer->preview($request->file('file'));
        $token = (string) Str::uuid();

        Cache::put($this->cacheKey($token), $preview['valid'], now()->addMinutes(30));

        return Inertia::render('students/import', [
            'preview' => [
                ...$preview,
                'token' => $token,
            ],
            'result' => null,
        ]);
    }

    public function store(CommitStudentImportRequest $request, CreateAuditLogAction $createAuditLog): RedirectResponse
    {
        $token = $request->validated('token');
        $rows = Cache::pull($this->cacheKey($token));

        if (! is_array($rows)) {
            return back()->withErrors(['token' => 'The import preview has expired. Please upload the file again.']);
        }

        $summary = DB::transaction(function () use ($rows, $request, $createAuditLog): array {
            $summary = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0];

            foreach ($rows as $row) {
                $studentData = $row['student'];
                $student = Student::query()
                    ->where('student_number', $studentData['student_number'])
                    ->first()
                    ?? (blank($studentData['email']) ? null : Student::query()->where('email', $studentData['email'])->first());

                $attributes = [
                    'student_number' => $studentData['student_number'],
                    'name' => $studentData['name'],
                    'email' => $studentData['email'],
                    'phone' => $studentData['phone'],
                    'course' => $studentData['course'],
                    'level' => $studentData['level'],
                    'updated_by_id' => $request->user()?->id,
                    'metadata' => $this->metadata($studentData),
                ];

                if ($student instanceof Student) {
                    $student->update($attributes);
                    $summary['updated']++;

                    continue;
                }

                Student::query()->create([
                    ...$attributes,
                    'created_by_id' => $request->user()?->id,
                ]);
                $summary['created']++;
            }

            $createAuditLog->handle(
                actor: $request->user(),
                event: AuditEvents::StudentsImported,
                description: 'Student records imported.',
                metadata: $summary,
                request: $request,
            );

            return $summary;
        });

        return to_route('students.import.show')
            ->with('studentImportResult', $summary);
    }

    private function cacheKey(string $token): string
    {
        return 'student-import:'.$token;
    }

    /**
     * @param  array<string, mixed>  $studentData
     * @return array<string, mixed>
     */
    private function metadata(array $studentData): array
    {
        return collect($studentData)
            ->only(['department', 'programme', 'gender', 'campus', 'entry_year', 'status'])
            ->filter(fn (mixed $value): bool => filled($value))
            ->all();
    }
}
