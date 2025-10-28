<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanySettingsController extends Controller
{
    /**
     * Show the company settings form.
     */
    public function edit(): Response
    {
        $settings = CompanySetting::get();

        return Inertia::render('Superadmin/Settings/CompanySettings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update company settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'], // 2MB max
            'receipt_header' => ['nullable', 'string'],
            'receipt_footer' => ['nullable', 'string'],
        ]);

        $settings = CompanySetting::get();

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }

            $logoPath = $request->file('logo')->store('company', 'public');
            $validated['logo_path'] = $logoPath;
        }

        $settings->update($validated);

        return back()->with('success', 'Company settings updated successfully.');
    }

    /**
     * Remove company logo.
     */
    public function removeLogo(): RedirectResponse
    {
        $settings = CompanySetting::get();

        if ($settings->logo_path) {
            Storage::disk('public')->delete($settings->logo_path);
            $settings->update(['logo_path' => null]);
        }

        return back()->with('success', 'Company logo removed successfully.');
    }
}
