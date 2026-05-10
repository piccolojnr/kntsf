<?php

namespace App\Http\Requests\Executives;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Spatie\Permission\Models\Role;

class StoreExecutiveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('executives.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'string', Rule::exists('roles', 'name')],
            'is_active' => ['nullable', 'boolean'],
            'send_setup_link' => ['nullable', 'boolean'],
            'position' => ['nullable', 'string', 'max:255'],
            'position_description' => ['nullable', 'string'],
            'biography' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['nullable', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $roles = collect($this->input('roles', []))->map(fn ($role): string => (string) $role);

                if ($roles->contains('student')) {
                    $validator->errors()->add('roles', 'Executive users cannot be assigned the student role here.');
                }

                if ($roles->contains('super_admin') && ! $this->user()?->hasRole('super_admin')) {
                    $validator->errors()->add('roles', 'Only super administrators can assign the super admin role.');
                }

                $existingRoles = Role::query()->whereIn('name', $roles)->pluck('name');
                if ($existingRoles->count() !== $roles->unique()->count()) {
                    $validator->errors()->add('roles', 'One or more selected roles are invalid.');
                }
            },
        ];
    }
}
