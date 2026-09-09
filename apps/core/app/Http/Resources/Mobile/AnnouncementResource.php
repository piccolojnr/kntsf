<?php

namespace App\Http\Resources\Mobile;

use App\Support\MediaCollections;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
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
            'content' => $this->content,
            'category' => $this->category,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->toISOString(),
            'image_url' => $this->getFirstMediaUrl(MediaCollections::FEATURED_IMAGE) ?: null,
            'gallery' => $this->getMedia(MediaCollections::GALLERY)->map(fn ($media): array => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'name' => $media->name,
            ])->values(),
            'author' => $this->whenLoaded('author', fn (): ?array => $this->author ? [
                'name' => $this->author->name,
            ] : null),
        ];
    }
}
