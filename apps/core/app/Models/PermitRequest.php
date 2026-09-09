<?php

namespace App\Models;

use App\Enums\PermitRequestReviewStatus;
use App\Enums\PermitRequestStatus;
use Database\Factories\PermitRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'student_id',
    'academic_period_id',
    'payment_id',
    'requested_by_user_id',
    'request_reference',
    'source',
    'status',
    'amount',
    'currency',
    'contact_email',
    'contact_phone',
    'requires_review',
    'review_status',
    'reviewed_by_id',
    'reviewed_at',
    'expires_at',
    'metadata',
])]
class PermitRequest extends Model
{
    /** @use HasFactory<PermitRequestFactory> */
    use HasFactory;

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    protected function casts(): array
    {
        return [
            'status' => PermitRequestStatus::class,
            'amount' => 'decimal:2',
            'requires_review' => 'boolean',
            'review_status' => PermitRequestReviewStatus::class,
            'reviewed_at' => 'datetime',
            'expires_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
