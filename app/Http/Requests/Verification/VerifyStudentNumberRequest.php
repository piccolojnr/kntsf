<?php

namespace App\Http\Requests\Verification;

use Illuminate\Foundation\Http\FormRequest;

class VerifyStudentNumberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('verification.perform') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'student_number' => ['required', 'string', 'max:50'],
        ];
    }
}
