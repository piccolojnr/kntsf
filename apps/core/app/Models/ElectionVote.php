<?php

namespace App\Models;

use Database\Factories\ElectionVoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'election_id',
    'election_position_id',
    'election_candidate_id',
    'student_id',
    'cast_at',
    'metadata',
])]
class ElectionVote extends Model
{
    /** @use HasFactory<ElectionVoteFactory> */
    use HasFactory;

    public $timestamps = false;

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(ElectionPosition::class, 'election_position_id');
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(ElectionCandidate::class, 'election_candidate_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    protected function casts(): array
    {
        return [
            'cast_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
