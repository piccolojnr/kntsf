<?php

namespace App\Http\Requests\Elections;

use App\Models\Election;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreElectionCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $election = $this->route('election');

        return $election instanceof Election
            && ($this->user()?->can('manageCandidates', $election) ?? false);
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
