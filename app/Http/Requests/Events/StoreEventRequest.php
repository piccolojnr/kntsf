<?php

namespace App\Http\Requests\Events;

use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Event;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Event::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('events', 'slug')],
            'description' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
            'visibility' => ['nullable', Rule::enum(Visibility::class)],
            'is_featured' => ['boolean'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'max_attendees' => ['nullable', 'integer', 'min:1'],
            'published_at' => ['nullable', 'date'],
            'banner' => ['nullable', 'image', 'max:5120'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['image', 'max:5120'],
        ];
    }
}
