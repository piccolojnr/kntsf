<?php

namespace App\Models;

use Database\Factories\ExecutiveProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ExecutiveProfile extends Model implements HasMedia
{
    /** @use HasFactory<ExecutiveProfileFactory> */
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'user_id',
        'position',
        'position_description',
        'biography',
        'category',
        'sort_order',
        'is_published',
        'social_links',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')->singleFile();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_published' => 'boolean',
            'social_links' => 'array',
        ];
    }
}
