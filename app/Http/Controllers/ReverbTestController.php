<?php

namespace App\Http\Controllers;

use App\Events\OrderStatusChanged;
use App\Events\ReverbTestEvent;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ReverbTestController extends Controller
{
    public function index(): Response
    {
        Log::channel('reverb')->info('Reverb Test Page Accessed', [
            'user_id' => auth()->id(),
            'timestamp' => now()->toIso8601String(),
        ]);

        return Inertia::render('ReverbTest', [
            'broadcastConnection' => config('broadcasting.default'),
            'reverbConfig' => [
                'app_key' => config('broadcasting.connections.reverb.key'),
                'host' => config('broadcasting.connections.reverb.options.host'),
                'port' => config('broadcasting.connections.reverb.options.port'),
                'scheme' => config('broadcasting.connections.reverb.options.scheme'),
            ],
            'recentOrders' => Purchase::latest()->take(5)->get(['id', 'trans_no', 'status']),
        ]);
    }

    public function triggerTestEvent(Request $request)
    {
        $message = $request->input('message', 'Manual Test Event Triggered');

        Log::channel('reverb')->info('Manual test event triggered', [
            'message' => $message,
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
        ]);

        broadcast(new ReverbTestEvent($message));

        return redirect()->back()->with('success', 'Test event broadcasted successfully!');
    }

    public function triggerOrderEvent(Request $request, int $orderId)
    {
        $order = Purchase::findOrFail($orderId);
        $oldStatus = $order->status;

        Log::channel('reverb')->info('Manual order event triggered', [
            'order_id' => $orderId,
            'old_status' => $oldStatus,
            'new_status' => $oldStatus, // Same status for test
            'user_id' => auth()->id(),
        ]);

        broadcast(new OrderStatusChanged($order, $oldStatus, $order->status));

        return redirect()->back()->with('success', 'Order event broadcasted successfully!');
    }

    public function getLogs()
    {
        $logPath = storage_path('logs/reverb.log');

        if (! file_exists($logPath)) {
            return response()->json([
                'success' => false,
                'message' => 'No reverb.log file found yet',
                'logs' => [],
            ]);
        }

        $logs = file($logPath);
        $recentLogs = array_slice($logs, -50); // Last 50 lines

        return response()->json([
            'success' => true,
            'logs' => $recentLogs,
            'total_lines' => count($logs),
        ]);
    }
}
