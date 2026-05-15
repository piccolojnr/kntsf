<?php

namespace App\Models;

use App\Enums\ElectionStatus;
use Database\Factories\ElectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'academic_period_id',
    'created_by_id',
    'title',
    'slug',
    'description',
    'status',
    'starts_at',
    'ends_at',
    'results_visible',
    'metadata',
])]
class Election extends Model
{
    /** @use HasFactory<ElectionFactory> */
    use HasFactory, SoftDeletes;

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(ElectionPosition::class)->orderBy('sort_order')->orderBy('id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ElectionVote::class);
    }

    #[Scope]
    protected function publicVisible(Builder $query): void
    {
        $query->whereIn('status', [
            ElectionStatus::Scheduled,
            ElectionStatus::Active,
            ElectionStatus::Closed,
        ]);
    }

    public function isOpenForVoting(): bool
    {
        return $this->status === ElectionStatus::Active
            && ($this->starts_at === null || $this->starts_at->lte(now()))
            && ($this->ends_at === null || $this->ends_at->gte(now()));
    }

    protected function casts(): array
    {
        return [
            'status' => ElectionStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'results_visible' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
