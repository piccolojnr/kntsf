<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionVoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'election_id' => $this->election_id,
            'position_id' => $this->election_position_id,
            'candidate_id' => $this->election_candidate_id,
            'cast_at' => $this->cast_at?->toISOString(),
            'candidate' => new ElectionCandidateResource($this->whenLoaded('candidate')),
        ];
    }
}
