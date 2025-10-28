<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureCashier
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (! $user) {
            return $request->expectsJson()
                ? abort(401, 'Authentication required.')
                : redirect()->route('login');
        }

        // Allow superadmin full access
        if ($user->utype === 'superadmin') {
            return $next($request);
        }

        if ($user->utype !== 'cashier') {
            if ($request->expectsJson()) {
                abort(403, 'Only cashiers may access this resource.');
            }

            // Redirect authenticated non-cashiers to a safe landing
            if ($user->utype === 'member' && \Route::has('dashboard')) {
                return redirect()->route('dashboard');
            }

            return redirect()->route('home');
        }

        return $next($request);
    }
}
