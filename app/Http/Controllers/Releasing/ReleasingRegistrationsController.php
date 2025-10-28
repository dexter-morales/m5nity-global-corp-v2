<?php

namespace App\Http\Controllers\Releasing;

use App\Events\RegistrationReleased;
use App\Http\Controllers\Controller;
use App\Models\MemberPin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReleasingRegistrationsController extends Controller
{
    public function index(Request $request): Response
    {
        // Get registrations ready for release (unused pins)
        $forReleaseRegistrations = DB::table('members_pin')
            ->join('members_info', 'members_pin.new_member_id', '=', 'members_info.id')
            ->where('members_pin.status', 'unused')
            ->orderBy('members_pin.created_at', 'desc')
            ->select([
                'members_pin.id',
                'members_pin.trans_no as transaction_number',
                'members_pin.payment_method',
                'members_pin.pin',
                'members_pin.status',
                'members_pin.created_at',
                'members_pin.updated_at',
                'members_info.MID as account_id',
                'members_info.email',
                DB::raw("CONCAT(members_info.fname, ' ', members_info.lname) as member_name"),
            ])
            ->get()
            ->map(function ($reg) {
                return [
                    'id' => $reg->id,
                    'transaction_number' => $reg->transaction_number,
                    'account_id' => $reg->account_id ?? 'N/A',
                    'member_name' => $reg->member_name,
                    'package_name' => 'Registration Package',
                    'package_price' => 0,
                    'payment_method' => $reg->payment_method,
                    'status' => 'for_release',
                    'created_at' => $reg->created_at,
                    'updated_at' => $reg->updated_at,
                ];
            });

        // Get completed registrations (used pins)
        $completedRegistrations = DB::table('members_pin')
            ->join('members_info', 'members_pin.new_member_id', '=', 'members_info.id')
            ->where('members_pin.status', 'used')
            ->orderBy('members_pin.updated_at', 'desc')
            ->limit(50)
            ->select([
                'members_pin.id',
                'members_pin.trans_no as transaction_number',
                'members_pin.payment_method',
                'members_pin.pin',
                'members_pin.status',
                'members_pin.created_at',
                'members_pin.updated_at',
                'members_info.MID as account_id',
                'members_info.email',
                DB::raw("CONCAT(members_info.fname, ' ', members_info.lname) as member_name"),
            ])
            ->get()
            ->map(function ($reg) {
                return [
                    'id' => $reg->id,
                    'transaction_number' => $reg->transaction_number,
                    'account_id' => $reg->account_id ?? 'N/A',
                    'member_name' => $reg->member_name,
                    'package_name' => 'Registration Package',
                    'package_price' => 0,
                    'payment_method' => $reg->payment_method,
                    'status' => 'completed',
                    'created_at' => $reg->created_at,
                    'updated_at' => $reg->updated_at,
                ];
            });

        return Inertia::render('Releasing/Registrations', [
            'for_release_registrations' => $forReleaseRegistrations,
            'completed_registrations' => $completedRegistrations,
        ]);
    }

    public function markAsReleased(Request $request, int $id)
    {
        try {
            DB::beginTransaction();

            $memberPin = MemberPin::find($id);

            if (! $memberPin) {
                DB::rollBack();

                return redirect()->back()->withErrors(['message' => 'Registration not found']);
            }

            if ($memberPin->status !== 'unused') {
                DB::rollBack();

                return redirect()->back()->withErrors(['message' => 'Registration is not ready for release']);
            }

            // Update pin status to 'used'
            $memberPin->update([
                'status' => 'used',
                'updated_at' => now(),
            ]);

            // Log activity
            if (class_exists('\App\Services\ActivityLogService')) {
                $activityLog = app(\App\Services\ActivityLogService::class);
                $activityLog->logRelease(Auth::id(), 'registration', $id, $memberPin->trans_no ?? "REG-{$id}");
            }

            // Broadcast real-time event
            broadcast(new RegistrationReleased($memberPin));

            DB::commit();

            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error releasing registration', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Failed to release registration']);
        }
    }
}
