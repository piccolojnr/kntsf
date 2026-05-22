<?php

namespace App\Http\Resources\Mobile;

use App\Support\MediaCollections;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExecutiveProfileResource extends JsonResource
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
            'name' => $this->whenLoaded('user', fn (): ?string => $this->user?->name),
            'position' => $this->position,
            'position_description' => $this->position_description,
            'biography' => $this->biography,
            'category' => $this->category,
            'avatar_url' => $this->getFirstMediaUrl(MediaCollections::AVATAR) ?: null,
        ];
    }
}
