<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request): Response
    {
        $user = auth()->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Role-based redirect after successful login
        $redirectUrl = match ($user->utype ?? 'member') {
            'admin', 'super_admin', 'superadmin' => route('superadmin.dashboard'),
            'cashier' => route('cashier.dashboard'),
            'accounting' => route('accounting.dashboard'),
            'releasing_personnel' => route('releasing.dashboard'),
            default => route('dashboard'), // Members and others
        };

        // Log the redirect for debugging
        \Illuminate\Support\Facades\Log::info('LoginResponse redirect', [
            'user_id' => $user->id,
            'utype' => $user->utype,
            'redirect_url' => $redirectUrl,
        ]);

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended($redirectUrl);
    }
}
