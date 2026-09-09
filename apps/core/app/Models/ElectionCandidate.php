<?php

namespace App\Models;

use App\Enums\CandidateStatus;
use App\Support\MediaCollections;
use Database\Factories\ElectionCandidateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

#[Fillable([
    'election_position_id',
    'student_id',
    'approved_by_id',
    'slogan',
    'manifesto',
    'status',
    'approved_at',
    'rejected_at',
    'withdrawn_at',
    'metadata',
])]
class ElectionCandidate extends Model implements HasMedia
{
    /** @use HasFactory<ElectionCandidateFactory> */
    use HasFactory, InteractsWithMedia;

    public function position(): BelongsTo
    {
        return $this->belongsTo(ElectionPosition::class, 'election_position_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ElectionVote::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(MediaCollections::POSTER)->singleFile();
        $this->addMediaCollection(MediaCollections::GALLERY);
    }

    protected function casts(): array
    {
        return [
            'status' => CandidateStatus::class,
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'withdrawn_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
