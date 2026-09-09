<?php

namespace App\Models;

use App\Enums\PermitStatus;
use Database\Factories\PermitFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'student_id',
    'academic_period_id',
    'issued_by_id',
    'code_hash',
    'code_last4',
    'status',
    'starts_at',
    'expires_at',
    'amount_paid',
    'currency',
    'card_delivered_at',
    'revoked_at',
    'revoked_by_id',
    'revocation_reason',
    'metadata',
])]
class Permit extends Model
{
    /** @use HasFactory<PermitFactory> */
    use HasFactory, SoftDeletes;

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by_id');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    protected function casts(): array
    {
        return [
            'status' => PermitStatus::class,
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'amount_paid' => 'decimal:2',
            'card_delivered_at' => 'datetime',
            'revoked_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
