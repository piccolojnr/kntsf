<?php

namespace App\Http\Requests\Polls;

use App\Models\Poll;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CastPollVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $poll = $this->route('poll');

        return $poll instanceof Poll
            && ($this->user()?->can('vote', $poll) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $poll = $this->route('poll');

        return [
            'poll_option_id' => [
                'nullable',
                'integer',
                Rule::exists('poll_options', 'id')->where('poll_id', $poll?->id),
            ],
            'option_text' => ['nullable', 'string', 'max:255'],
        ];
    }
}
