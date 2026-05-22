<?php

namespace App\Http\Resources\Mobile;

use App\Support\MediaCollections;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionCandidateResource extends JsonResource
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
            'student_id' => $this->student_id,
            'name' => $this->student?->name,
            'student_number' => $this->student?->student_number,
            'course' => $this->student?->course,
            'level' => $this->student?->level,
            'slogan' => $this->slogan,
            'manifesto' => $this->manifesto,
            'status' => $this->status->value,
            'poster_url' => $this->getFirstMediaUrl(MediaCollections::POSTER) ?: null,
            'votes_count' => $this->whenCounted('votes'),
        ];
    }
}
