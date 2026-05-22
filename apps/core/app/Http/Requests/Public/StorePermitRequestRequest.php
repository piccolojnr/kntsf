<?php

namespace App\Http\Requests\Public;

use App\Support\StudentOptions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePermitRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(StudentOptions $studentOptions): array
    {
        return [
            'student_number' => ['required', 'string', 'max:50'],
            'student_exists' => ['nullable', 'boolean'],
            'name' => [Rule::requiredIf(! $this->boolean('student_exists')), 'nullable', 'string', 'max:255'],
            'email' => [Rule::requiredIf(! $this->boolean('student_exists')), 'nullable', 'email', 'max:255'],
            'phone' => [Rule::requiredIf(! $this->boolean('student_exists')), 'nullable', 'string', 'max:50'],
            'course' => [Rule::requiredIf(! $this->boolean('student_exists')), 'nullable', 'string', 'max:255', Rule::in($studentOptions->courseValues())],
            'level' => [Rule::requiredIf(! $this->boolean('student_exists')), 'nullable', 'string', 'max:100', Rule::in($studentOptions->levelValues())],
        ];
    }
}
