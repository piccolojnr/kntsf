<?php

namespace App\Models;

use App\Enums\AccountActivationPurpose;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'token_hash', 'purpose', 'expires_at', 'used_at'])]
class AccountActivationToken extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function isValid(): bool
    {
        return ! $this->isExpired() && ! $this->isUsed();
    }

    protected function casts(): array
    {
        return [
            'purpose' => AccountActivationPurpose::class,
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }
}
