<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorLoginResponse implements TwoFactorLoginResponseContract
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

        // Role-based redirect after successful two-factor authentication
        $redirectUrl = match ($user->utype ?? 'member') {
            'admin', 'super_admin', 'superadmin' => route('superadmin.dashboard'),
            'cashier' => route('cashier.dashboard'),
            'accounting' => route('accounting.dashboard'),
            'releasing_personnel' => route('releasing.dashboard'),
            default => route('dashboard'), // Members and others
        };

        // Log the redirect for debugging
        \Illuminate\Support\Facades\Log::info('TwoFactorLoginResponse redirect', [
            'user_id' => $user->id,
            'utype' => $user->utype,
            'redirect_url' => $redirectUrl,
        ]);

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended($redirectUrl);
    }
}
