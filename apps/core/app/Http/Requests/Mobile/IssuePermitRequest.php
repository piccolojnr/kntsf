<?php

namespace App\Http\Requests\Mobile;

use App\Models\Permit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IssuePermitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Permit::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:students,id'],
            'student_email' => ['nullable', 'email', 'max:255'],
            'academic_period_id' => ['nullable', 'exists:academic_periods,id'],
            'starts_at' => ['prohibited'],
            'expires_at' => ['prohibited'],
            'amount_paid' => ['prohibited'],
            'currency' => ['prohibited'],
        ];
    }
}
