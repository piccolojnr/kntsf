<?php

namespace App\Models;

use App\Enums\ElectionPositionStatus;
use Database\Factories\ElectionPositionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'election_id',
    'title',
    'description',
    'max_winners',
    'status',
    'sort_order',
])]
class ElectionPosition extends Model
{
    /** @use HasFactory<ElectionPositionFactory> */
    use HasFactory;

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(ElectionCandidate::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ElectionVote::class);
    }

    protected function casts(): array
    {
        return [
            'status' => ElectionPositionStatus::class,
            'max_winners' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
