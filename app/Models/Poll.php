<?php

namespace App\Models;

use App\Enums\PollType;
use App\Enums\PublishStatus;
use App\Enums\Visibility;
use Database\Factories\PollFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'created_by_id',
    'title',
    'slug',
    'description',
    'type',
    'status',
    'visibility',
    'starts_at',
    'ends_at',
    'show_results',
    'allow_vote_change',
    'metadata',
])]
class Poll extends Model
{
    /** @use HasFactory<PollFactory> */
    use HasFactory, SoftDeletes;

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(PollOption::class)->orderBy('sort_order')->orderBy('id');
    }

    public function activeOptions(): HasMany
    {
        return $this->hasMany(PollOption::class)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(PollVote::class);
    }

    public function isOpenForVoting(): bool
    {
        return $this->status === PublishStatus::Published
            && ($this->starts_at === null || $this->starts_at->lte(now()))
            && ($this->ends_at === null || $this->ends_at->gte(now()));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => PollType::class,
            'status' => PublishStatus::class,
            'visibility' => Visibility::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'show_results' => 'boolean',
            'allow_vote_change' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
