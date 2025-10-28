<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Activity::with('causer', 'subject')
            ->latest();

        // Filter by log name/type
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Filter by causer (user)
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search in description
        if ($request->filled('search')) {
            $query->where('description', 'like', '%'.$request->search.'%');
        }

        $activities = $query->paginate(50);

        // Get distinct log names for filter
        $logNames = Activity::distinct('log_name')
            ->pluck('log_name')
            ->filter()
            ->values();

        return Inertia::render('Superadmin/ActivityLogs', [
            'activities' => $activities,
            'log_names' => $logNames,
            'filters' => $request->only(['log_name', 'causer_id', 'date_from', 'date_to', 'search']),
        ]);
    }
}
