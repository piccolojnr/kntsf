<?php

namespace App\Models;

use App\Enums\VerificationMethod;
use App\Enums\VerificationResult;
use Database\Factories\VerificationLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'method',
    'result',
    'identifier_hash',
    'reason',
    'student_id',
    'permit_id',
    'verifier_id',
    'ip_address',
    'user_agent',
    'metadata',
])]
class VerificationLog extends Model
{
    /** @use HasFactory<VerificationLogFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function permit(): BelongsTo
    {
        return $this->belongsTo(Permit::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifier_id');
    }

    protected function casts(): array
    {
        return [
            'method' => VerificationMethod::class,
            'result' => VerificationResult::class,
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
