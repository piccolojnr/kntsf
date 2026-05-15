<?php

namespace App\Http\Requests\Elections;

use App\Models\ElectionCandidate;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateElectionCandidateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $candidate = $this->route('candidate');

        return $candidate instanceof ElectionCandidate
            && ($this->user()?->can('manageCandidates', $candidate->position->election) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'slogan' => ['nullable', 'string', 'max:255'],
            'manifesto' => ['nullable', 'string'],
            'poster' => ['nullable', 'image', 'max:5120'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['image', 'max:5120'],
        ];
    }
}
