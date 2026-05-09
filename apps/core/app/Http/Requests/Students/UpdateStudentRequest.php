<?php

namespace App\Http\Requests\Students;

use App\Models\Student;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $student = $this->route('student');

        return $student instanceof Student
            && ($this->user()?->can('update', $student) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $student = $this->route('student');

        return [
            'student_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique(Student::class, 'student_number')->ignore($student instanceof Student ? $student : null),
            ],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'course' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'max:100'],
        ];
    }
}
