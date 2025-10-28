<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = Auth::user();

        if (! $user) {
            return $request->expectsJson()
                ? abort(401, 'Authentication required.')
                : redirect()->route('login');
        }

        // Debug log
        \Illuminate\Support\Facades\Log::info('EnsureRole check', [
            'user_id' => $user->id,
            'user_utype' => $user->utype,
            'required_roles' => $roles,
            'path' => $request->path(),
        ]);

        // Allow superadmin full access to all roles
        if ($user->utype === 'superadmin') {
            \Illuminate\Support\Facades\Log::info('EnsureRole ALLOWED (superadmin)', [
                'user_id' => $user->id,
                'user_utype' => $user->utype,
            ]);

            return $next($request);
        }

        if (! in_array((string) ($user->utype ?? ''), $roles, true)) {
            \Illuminate\Support\Facades\Log::warning('EnsureRole DENIED', [
                'user_id' => $user->id,
                'user_utype' => $user->utype,
                'required_roles' => $roles,
            ]);

            if ($request->expectsJson()) {
                abort(403, 'Unauthorized for this area.');
            }

            // Soft land non-authorized roles
            if ($user->utype === 'member' && \Route::has('dashboard')) {
                return redirect()->route('dashboard');
            }
            if ($user->utype === 'cashier' && \Route::has('cashier.registrations.index')) {
                return redirect()->route('cashier.registrations.index');
            }
            if ($user->utype === 'accounting' && \Route::has('accounting.dashboard')) {
                return redirect()->route('accounting.dashboard');
            }
            if (($user->utype === 'admin' || $user->utype === 'super_admin') && \Route::has('admin.dashboard')) {
                return redirect()->route('admin.dashboard');
            }
            if ($user->utype === 'superadmin' && \Route::has('superadmin.dashboard')) {
                return redirect()->route('superadmin.dashboard');
            }
            if ($user->utype === 'releasing_personnel' && \Route::has('releasing.dashboard')) {
                return redirect()->route('releasing.dashboard');
            }

            return redirect()->route('home');
        }

        \Illuminate\Support\Facades\Log::info('EnsureRole ALLOWED', [
            'user_id' => $user->id,
            'user_utype' => $user->utype,
        ]);

        return $next($request);
    }
}
