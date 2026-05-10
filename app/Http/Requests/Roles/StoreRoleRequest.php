<?php

namespace App\Http\Requests\Roles;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('roles.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'alpha_dash:ascii', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['required', 'string', Rule::exists('permissions', 'name')],
        ];
    }
}
