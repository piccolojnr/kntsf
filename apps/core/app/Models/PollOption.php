<?php

namespace App\Models;

use App\Enums\PollOptionStatus;
use Database\Factories\PollOptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'poll_id',
    'text',
    'status',
    'merged_into_id',
    'created_by_student_id',
    'sort_order',
])]
class PollOption extends Model
{
    /** @use HasFactory<PollOptionFactory> */
    use HasFactory;

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class);
    }

    public function mergedInto(): BelongsTo
    {
        return $this->belongsTo(PollOption::class, 'merged_into_id');
    }

    public function createdByStudent(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'created_by_student_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(PollVote::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (PollOption $option): bool {
            return ! $option->votes()->exists();
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PollOptionStatus::class,
            'sort_order' => 'integer',
        ];
    }
}
