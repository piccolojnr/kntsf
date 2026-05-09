<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\StoreStudentRequest;
use App\Http\Requests\Students\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Student::class);

        $search = $request->string('search')->trim()->toString();

        $students = Student::query()
            ->select(['id', 'student_number', 'name', 'email', 'phone', 'course', 'level', 'created_at'])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('student_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('course', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Student $student): array => $this->studentPayload($student));

        return Inertia::render('students/index', [
            'students' => $students,
            'filters' => [
                'search' => $search,
            ],
            'can' => [
                'create' => $request->user()?->can('create', Student::class) ?? false,
                'update' => $request->user()?->can('students.update') ?? false,
                'delete' => $request->user()?->can('students.delete') ?? false,
            ],
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $student = Student::create([
            ...$request->validated(),
            'created_by_id' => $request->user()?->id,
            'updated_by_id' => $request->user()?->id,
        ]);

        return to_route('students.index');
    }

    public function show(Request $request, Student $student): Response
    {
        Gate::authorize('view', $student);

        return Inertia::render('students/show', [
            'student' => $this->studentPayload($student),
            'can' => [
                'update' => $request->user()?->can('update', $student) ?? false,
                'delete' => $request->user()?->can('delete', $student) ?? false,
            ],
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $student->update([
            ...$request->validated(),
            'updated_by_id' => $request->user()?->id,
        ]);

        return back();
    }

    public function destroy(Student $student): RedirectResponse
    {
        Gate::authorize('delete', $student);

        $student->delete();

        return to_route('students.index');
    }

    /**
     * @return array{id: int, student_number: string, name: string|null, email: string|null, phone: string|null, course: string|null, level: string|null, created_at: string|null}
     */
    private function studentPayload(Student $student): array
    {
        return [
            'id' => $student->id,
            'student_number' => $student->student_number,
            'name' => $student->name,
            'email' => $student->email,
            'phone' => $student->phone,
            'course' => $student->course,
            'level' => $student->level,
            'created_at' => $student->created_at?->toISOString(),
        ];
    }
}
