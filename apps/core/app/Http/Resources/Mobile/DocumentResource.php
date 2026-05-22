<?php

namespace App\Http\Resources\Mobile;

use App\Support\MediaCollections;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
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
            'category' => $this->category,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->toISOString(),
            'image_url' => $this->getFirstMediaUrl(MediaCollections::FEATURED_IMAGE) ?: null,
            'author' => $this->whenLoaded('author', fn (): ?array => $this->author ? [
                'name' => $this->author->name,
            ] : null),
            'files' => $this->getMedia(MediaCollections::FILES)->map(fn ($media): array => [
                'id' => $media->id,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'human_size' => $media->human_readable_size,
                'url' => $media->getUrl(),
            ])->values(),
        ];
    }
}
