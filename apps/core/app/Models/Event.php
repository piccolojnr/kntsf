<?php

namespace App\Models;

use App\Enums\PublishStatus;
use App\Enums\Visibility;
use App\Support\MediaCollections;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

#[Fillable([
    'organizer_id',
    'title',
    'slug',
    'description',
    'excerpt',
    'location',
    'category',
    'status',
    'visibility',
    'is_featured',
    'starts_at',
    'ends_at',
    'max_attendees',
    'current_attendees',
    'published_at',
    'archived_at',
    'metadata',
])]
class Event extends Model implements HasMedia
{
    /** @use HasFactory<EventFactory> */
    use HasFactory, InteractsWithMedia, SoftDeletes;

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(MediaCollections::BANNER)->singleFile();
        $this->addMediaCollection(MediaCollections::GALLERY);
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
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'max_attendees' => 'integer',
            'current_attendees' => 'integer',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
