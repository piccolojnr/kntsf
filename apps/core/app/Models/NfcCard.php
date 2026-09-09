<?php

namespace App\Models;

use App\Enums\NfcCardStatus;
use Database\Factories\NfcCardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'student_id',
    'uid_hash',
    'uid_last4',
    'status',
    'issued_at',
    'activated_at',
    'deactivated_at',
    'replaced_at',
    'lost_at',
    'created_by_id',
    'metadata',
])]
class NfcCard extends Model
{
    /** @use HasFactory<NfcCardFactory> */
    use HasFactory, SoftDeletes;

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    protected function casts(): array
    {
        return [
            'status' => NfcCardStatus::class,
            'issued_at' => 'datetime',
            'activated_at' => 'datetime',
            'deactivated_at' => 'datetime',
            'replaced_at' => 'datetime',
            'lost_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
