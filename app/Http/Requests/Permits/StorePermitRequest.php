<?php

namespace App\Http\Requests\Permits;

use App\Models\Permit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePermitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Permit::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('currency')) {
            $this->merge([
                'currency' => mb_strtoupper((string) $this->input('currency')),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', Rule::exists('students', 'id')],
            'student_email' => ['nullable', 'email', 'max:255'],
            'academic_period_id' => ['nullable', Rule::exists('academic_periods', 'id')],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
        ];
    }
}
