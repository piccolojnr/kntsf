<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        if ($request instanceof Request && $request->user()?->hasOnlyStudentRole()) {
            return redirect()->intended(route('account.mobile-app', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
