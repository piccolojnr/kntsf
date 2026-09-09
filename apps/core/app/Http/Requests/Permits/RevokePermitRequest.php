<?php

namespace App\Http\Requests\Permits;

use App\Models\Permit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RevokePermitRequest extends FormRequest
{
    public function authorize(): bool
    {
        $permit = $this->route('permit');

        return $permit instanceof Permit
            && ($this->user()?->can('revoke', $permit) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'revocation_reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
