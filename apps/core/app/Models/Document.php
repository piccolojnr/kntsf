<?php

namespace App\Models;

use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Support\MediaCollections;
use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

#[Fillable([
    'author_id',
    'title',
    'slug',
    'excerpt',
    'description',
    'category',
    'status',
    'visibility',
    'is_featured',
    'published_at',
    'archived_at',
    'metadata',
])]
class Document extends Model implements HasMedia
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory, InteractsWithMedia, SoftDeletes;

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(MediaCollections::FILES);
        $this->addMediaCollection(MediaCollections::FEATURED_IMAGE)->singleFile();
    }

    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', PublishStatus::Published)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    #[Scope]
    protected function publicVisible(Builder $query): void
    {
        $query->where('visibility', Visibility::Public);
    }

    #[Scope]
    protected function featured(Builder $query): void
    {
        $query->where('is_featured', true);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PublishStatus::class,
            'visibility' => Visibility::class,
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
