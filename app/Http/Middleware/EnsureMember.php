<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureMember
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (! $user) {
            return $request->expectsJson()
                ? abort(401, 'Authentication required.')
                : redirect()->route('login');
        }

        $isMember = ($user->utype === 'member') || method_exists($user, 'memberInfo') && $user->memberInfo()->exists();

        if (! $isMember) {
            if ($request->expectsJson()) {
                abort(403, 'Only members may access this resource.');
            }

            // Redirect authenticated non-members to a safe landing
            if ($user->utype === 'cashier' && \Route::has('cashier.registrations.index')) {
                return redirect()->route('cashier.registrations.index');
            }

            return redirect()->route('home');
        }

        return $next($request);
    }
}
