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

        // Allow superadmin full access
        if ($user->utype === 'superadmin') {
            return $next($request);
        }

        $isMember = ($user->utype === 'member') || method_exists($user, 'memberInfo') && $user->memberInfo()->exists();

        if (! $isMember) {
            if ($request->expectsJson()) {
                abort(403, 'Only members may access this resource.');
            }

            // Redirect authenticated non-members to their appropriate dashboards
            if ($user->utype === 'cashier' && \Route::has('cashier.registrations.index')) {
                return redirect()->route('cashier.registrations.index');
            }
            if ($user->utype === 'releasing_personnel' && \Route::has('releasing.dashboard')) {
                return redirect()->route('releasing.dashboard');
            }
            if ($user->utype === 'accounting' && \Route::has('accounting.dashboard')) {
                return redirect()->route('accounting.dashboard');
            }
            if (($user->utype === 'admin' || $user->utype === 'super_admin') && \Route::has('admin.dashboard')) {
                return redirect()->route('admin.dashboard');
            }

            return redirect()->route('home');
        }

        return $next($request);
    }
}
