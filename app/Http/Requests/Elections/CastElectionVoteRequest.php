<?php

namespace App\Http\Requests\Elections;

use App\Models\Election;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CastElectionVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $election = $this->route('election');

        return $election instanceof Election
            && ($this->user()?->can('vote', $election) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $position = $this->route('position');

        return [
            'election_candidate_id' => [
                'required',
                'integer',
                Rule::exists('election_candidates', 'id')->where('election_position_id', $position?->id),
            ],
        ];
    }
}
