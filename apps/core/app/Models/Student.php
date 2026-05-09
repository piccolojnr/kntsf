<?php

namespace App\Models;

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

    public function permits(): HasMany
    {
        return $this->hasMany(Permit::class);
    }

    public function nfcCards(): HasMany
    {
        return $this->hasMany(NfcCard::class);
    }

    public function activeNfcCard(): HasOne
    {
        return $this->hasOne(NfcCard::class)->where('status', 'active');
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}
