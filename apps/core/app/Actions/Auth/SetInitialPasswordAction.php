<?php

namespace App\Actions\Auth;

use App\Enums\AccountActivationPurpose;
use App\Models\AccountActivationToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SetInitialPasswordAction
{
    public function handle(string $token, string $password): User
    {
        return DB::transaction(function () use ($token, $password): User {
            $activationToken = AccountActivationToken::query()
                ->where('token_hash', hash('sha256', $token))
                ->where('purpose', AccountActivationPurpose::SetupPassword)
                ->lockForUpdate()
                ->first();

            if (! $activationToken?->isValid()) {
                throw ValidationException::withMessages([
                    'token' => 'This setup password link is invalid or has expired.',
                ]);
            }

            $user = $activationToken->user;

            $user->forceFill([
                'password' => $password,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ])->save();

            $activationToken->forceFill([
                'used_at' => now(),
            ])->save();

            return $user;
        });
    }
}
