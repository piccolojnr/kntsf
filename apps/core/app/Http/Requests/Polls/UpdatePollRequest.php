<?php

namespace App\Http\Requests\Polls;

use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Models\Poll;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePollRequest extends FormRequest
{
    public function authorize(): bool
    {
        $poll = $this->route('poll');

        return $poll instanceof Poll
            && ($this->user()?->can('update', $poll) ?? false);
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
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('polls', 'slug')->ignore($this->route('poll')),
            ],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', Rule::enum(PollType::class)],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
            'visibility' => ['nullable', Rule::enum(Visibility::class)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'show_results' => ['boolean'],
            'allow_vote_change' => ['boolean'],
            'options' => ['nullable', 'array'],
            'options.*.id' => ['nullable', 'integer', 'exists:poll_options,id'],
            'options.*.text' => ['nullable', 'string', 'max:255'],
        ];
    }
}
