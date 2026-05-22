<?php

namespace App\Http\Resources\Mobile;

use App\Support\MediaCollections;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
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
            'slug' => $this->slug,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'description' => $this->description,
            'location' => $this->location,
            'category' => $this->category,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'max_attendees' => $this->max_attendees,
            'current_attendees' => $this->current_attendees,
            'published_at' => $this->published_at?->toISOString(),
            'banner_url' => $this->getFirstMediaUrl(MediaCollections::BANNER) ?: null,
            'gallery' => $this->getMedia(MediaCollections::GALLERY)->map(fn ($media): array => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'name' => $media->name,
            ])->values(),
            'organizer' => $this->whenLoaded('organizer', fn (): ?array => $this->organizer ? [
                'name' => $this->organizer->name,
            ] : null),
        ];
    }
}
