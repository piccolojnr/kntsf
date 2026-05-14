<?php

namespace App\Models;

use Database\Factories\AcademicPeriodFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'academic_year',
    'semester',
    'starts_at',
    'ends_at',
    'is_active',
    'metadata',
])]
class AcademicPeriod extends Model
{
    /** @use HasFactory<AcademicPeriodFactory> */
    use HasFactory, SoftDeletes;

    public function permits(): HasMany
    {
        return $this->hasMany(Permit::class);
    }

    public function elections(): HasMany
    {
        return $this->hasMany(Election::class);
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'ends_at' => 'date',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
