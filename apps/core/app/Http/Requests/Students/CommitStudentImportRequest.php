<?php

namespace App\Http\Requests\Students;

use App\Models\Student;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CommitStudentImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('import', Student::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
        ];
    }
}
