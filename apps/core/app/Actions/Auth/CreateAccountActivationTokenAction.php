<?php

namespace App\Actions\Auth;

use App\Enums\AccountActivationPurpose;
use App\Models\AccountActivationToken;
use App\Models\User;
use Illuminate\Support\Str;

class CreateAccountActivationTokenAction
{
    /**
     * @return array{token: string, activationToken: AccountActivationToken}
     */
    public function handle(User $user, AccountActivationPurpose $purpose = AccountActivationPurpose::SetupPassword): array
    {
        $user->accountActivationTokens()
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $token = Str::random(64);

        $activationToken = $user->accountActivationTokens()->create([
            'token_hash' => hash('sha256', $token),
            'purpose' => $purpose,
            'expires_at' => now()->addHours(24),
        ]);

        return [
            'token' => $token,
            'activationToken' => $activationToken,
        ];
    }
}
