<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateContentSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('content_settings.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'allow_public_news' => $this->boolean('allow_public_news'),
            'allow_public_events' => $this->boolean('allow_public_events'),
            'allow_public_documents' => $this->boolean('allow_public_documents'),
            'enable_comments' => $this->boolean('enable_comments'),
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
            'allow_public_news' => ['required', 'boolean'],
            'allow_public_events' => ['required', 'boolean'],
            'allow_public_documents' => ['required', 'boolean'],
            'homepage_featured_limit' => ['required', 'integer', 'min:1', 'max:24'],
            'enable_comments' => ['required', 'boolean'],
        ];
    }
}
