<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\SetInitialPasswordAction;
use App\Enums\AccountActivationPurpose;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SetInitialPasswordRequest;
use App\Models\AccountActivationToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SetupPasswordController extends Controller
{
    public function show(string $token): Response
    {
        $activationToken = $this->validTokenOrFail($token);

        return Inertia::render('auth/setup-password', [
            'token' => $token,
            'email' => $activationToken->user->email,
        ]);
    }

    public function store(
        SetInitialPasswordRequest $request,
        string $token,
        SetInitialPasswordAction $setInitialPassword,
    ): RedirectResponse {
        Auth::logout();

        $setInitialPassword->handle($token, $request->validated('password'));

        return to_route('login')->with('status', 'Password set. You may now log in.');
    }

    private function validTokenOrFail(string $token): AccountActivationToken
    {
        $activationToken = AccountActivationToken::query()
            ->where('token_hash', hash('sha256', $token))
            ->where('purpose', AccountActivationPurpose::SetupPassword)
            ->firstOrFail();

        abort_if(! $activationToken->isValid(), 404);

        return $activationToken;
    }
}
