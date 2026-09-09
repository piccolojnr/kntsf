<?php

namespace App\Http\Requests\Verification;

use Illuminate\Foundation\Http\FormRequest;

class VerifyPermitCodeRequest extends FormRequest
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
            'permit_code' => ['required', 'string', 'max:100'],
        ];
    }
}
