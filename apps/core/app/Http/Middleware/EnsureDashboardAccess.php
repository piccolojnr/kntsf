<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDashboardAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->hasOnlyStudentRole()) {
            if ($request->routeIs('dashboard', 'profile.*', 'security.*', 'appearance.*', 'permit-settings.*', 'platform-settings.*')) {
                return redirect()->route('account.mobile-app');
            }

            abort(403);
        }

        return $next($request);
    }
}
