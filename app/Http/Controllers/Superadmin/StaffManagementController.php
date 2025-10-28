<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffManagementController extends Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index(Request $request): Response
    {
        $query = User::with('staffProfile')
            ->whereIn('utype', ['admin', 'super_admin', 'superadmin', 'cashier', 'accounting', 'releasing_personnel']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $query->where('utype', $request->role);
        }

        $staff = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Superadmin/Staff/Index', [
            'staff' => $staff,
            'filters' => $request->only(['search', 'role']),
            'roles' => [
                'superadmin' => 'Super Admin',
                'admin' => 'Admin',
                'cashier' => 'Cashier',
                'accounting' => 'Accounting',
                'releasing_personnel' => 'Releasing Personnel',
            ],
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create(): Response
    {
        return Inertia::render('Superadmin/Staff/Create', [
            'roles' => [
                'superadmin' => 'Super Admin',
                'admin' => 'Admin',
                'cashier' => 'Cashier',
                'accounting' => 'Accounting',
                'releasing_personnel' => 'Releasing Personnel',
            ],
        ]);
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'utype' => ['required', 'string', Rule::in(['superadmin', 'admin', 'cashier', 'accounting', 'releasing_personnel'])],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'utype' => $validated['utype'],
            ]);

            StaffProfile::create([
                'user_id' => $user->id,
                'role' => $validated['utype'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'contact_number' => $validated['contact_number'] ?? null,
                'department' => $validated['department'] ?? null,
            ]);
        });

        return redirect()->route('superadmin.staff.index')
            ->with('success', 'Staff member created successfully.');
    }

    /**
     * Show the form for editing a staff member.
     */
    public function edit(User $user): Response
    {
        $user->load('staffProfile');

        return Inertia::render('Superadmin/Staff/Edit', [
            'staff' => $user,
            'roles' => [
                'superadmin' => 'Super Admin',
                'admin' => 'Admin',
                'cashier' => 'Cashier',
                'accounting' => 'Accounting',
                'releasing_personnel' => 'Releasing Personnel',
            ],
        ]);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'utype' => ['required', 'string', Rule::in(['superadmin', 'admin', 'cashier', 'accounting', 'releasing_personnel'])],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'utype' => $validated['utype'],
                ...($validated['password'] ? ['password' => Hash::make($validated['password'])] : []),
            ]);

            $user->staffProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'role' => $validated['utype'],
                    'first_name' => $validated['first_name'],
                    'middle_name' => $validated['middle_name'] ?? null,
                    'last_name' => $validated['last_name'],
                    'contact_number' => $validated['contact_number'] ?? null,
                    'department' => $validated['department'] ?? null,
                ]
            );
        });

        return redirect()->route('superadmin.staff.index')
            ->with('success', 'Staff member updated successfully.');
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent superadmin from deleting themselves
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        DB::transaction(function () use ($user) {
            $user->staffProfile()->delete();
            $user->delete();
        });

        return redirect()->route('superadmin.staff.index')
            ->with('success', 'Staff member deleted successfully.');
    }
}
