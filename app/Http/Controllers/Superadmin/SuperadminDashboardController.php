<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SuperadminDashboardController extends Controller
{
    public function index(): Response
    {
        $phpVersion = PHP_VERSION;
        $laravelVersion = app()->version();
        $jobs = DB::table('jobs')->count();
        $failed = DB::table('failed_jobs')->count();

        return Inertia::render('Superadmin/Dashboard', [
            'system' => [
                'php' => $phpVersion,
                'laravel' => $laravelVersion,
            ],
            'queues' => [
                'pending' => $jobs,
                'failed' => $failed,
            ],
        ]);
    }
}

