<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberAccount;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $activeMembers = User::where('utype', 'member')->count();
        $newMembers7d = User::where('utype', 'member')->where('created_at', '>=', now()->subDays(7))->count();
        $totalAccounts = MemberAccount::count();
        $queuePending = DB::table('jobs')->count();
        $failed = DB::table('failed_jobs')->count();

        $latestUsers = User::orderByDesc('created_at')->limit(10)->get(['id', 'name', 'email', 'utype', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'active_members' => $activeMembers,
                'new_members_7d' => $newMembers7d,
                'total_accounts' => $totalAccounts,
                'queue_pending' => $queuePending,
                'failed_jobs' => $failed,
            ],
            'latestUsers' => $latestUsers,
        ]);
    }
}

