<?php

namespace App\Http\Resources\Mobile;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionPositionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $student = $request->user()?->student;
        $vote = $student instanceof Student
            ? $this->votes->firstWhere('student_id', $student->id)
            : null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'max_winners' => $this->max_winners,
            'status' => $this->status->value,
            'sort_order' => $this->sort_order,
            'has_voted' => $vote !== null,
            'vote' => $vote ? new ElectionVoteResource($vote->loadMissing('candidate.student')) : null,
            'candidates' => ElectionCandidateResource::collection($this->whenLoaded('candidates')),
        ];
    }
}
