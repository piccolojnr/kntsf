<?php

namespace App\Models;

use App\Enums\StudentSource;
use App\Enums\StudentVerificationStatus;
use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'user_id',
    'student_number',
    'name',
    'email',
    'phone',
    'course',
    'level',
    'source',
    'verification_status',
    'verified_at',
    'verified_by_id',
    'review_notes',
    'metadata',
    'created_by_id',
    'updated_by_id',
])]
class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory, SoftDeletes;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_id');
    }

    public function permits(): HasMany
    {
        return $this->hasMany(Permit::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function permitRequests(): HasMany
    {
        return $this->hasMany(PermitRequest::class);
    }

    public function nfcCards(): HasMany
    {
        return $this->hasMany(NfcCard::class);
    }

    public function activeNfcCard(): HasOne
    {
        return $this->hasOne(NfcCard::class)->where('status', 'active');
    }

    public function pollVotes(): HasMany
    {
        return $this->hasMany(PollVote::class);
    }

    public function electionCandidates(): HasMany
    {
        return $this->hasMany(ElectionCandidate::class);
    }

    public function electionVotes(): HasMany
    {
        return $this->hasMany(ElectionVote::class);
    }

    protected function casts(): array
    {
        return [
            'source' => StudentSource::class,
            'verification_status' => StudentVerificationStatus::class,
            'verified_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
