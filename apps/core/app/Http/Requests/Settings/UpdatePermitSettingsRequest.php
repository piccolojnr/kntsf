<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePermitSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('permit_settings.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'currency' => mb_strtoupper((string) $this->input('currency', '')),
            'permit_requests_enabled' => $this->boolean('permit_requests_enabled'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'default_amount' => ['required', 'numeric', 'min:0', 'max:999999'],
            'currency' => ['required', 'string', 'size:3'],
            'default_validity_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'permit_requests_enabled' => ['required', 'boolean'],
        ];
    }
}
