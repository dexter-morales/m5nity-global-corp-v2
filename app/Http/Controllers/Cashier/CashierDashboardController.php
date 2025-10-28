<?php

namespace App\Http\Controllers\Cashier;

use App\Exports\CashierReportExport;
use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\MemberPin;
use App\Models\PaymentMethod;
use App\Models\Purchase;
use App\Models\TransactionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class CashierDashboardController extends Controller
{
    private const LOG_FILE = 'CashierDashboard_logs.log';

    public function index(): Response
    {
        $userId = Auth::id();

        $today = now()->toDateString();

        $registrationsToday = TransactionHistory::where('cashier_id', $userId)
            ->whereDate('created_at', $today)->count();

        $collectedToday = TransactionHistory::where('cashier_id', $userId)
            ->whereDate('created_at', $today)
            ->select(DB::raw('payment_method, count(*) as total'))
            ->groupBy('payment_method')->get();

        $unusedPins = MemberPin::where('status', 'unused')->count();

        $transactions = TransactionHistory::with('memberPin')
            ->where('cashier_id', $userId)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'created_at' => optional($t->created_at)->toIso8601String(),
                'trans_no' => $t->trans_no,
                'payment_method' => $t->payment_method,
                'member_email' => $t->member_email,
                'pin' => $t->memberPin?->pin,
            ]);

        $pinSummary = MemberPin::select(DB::raw('status, count(*) as total'))
            ->groupBy('status')->pluck('total', 'status');

        // Get payment methods
        $paymentMethods = PaymentMethod::active()->get(['id', 'name', 'code']);

        return Inertia::render('Cashier/Dashboard', [
            'metrics' => [
                'registrations_today' => $registrationsToday,
                'unused_pins' => $unusedPins,
                'collected_today' => $collectedToday,
            ],
            'transactions' => $transactions,
            'pinSummary' => (object) $pinSummary->toArray(),
            'showReports' => false,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function reports(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'payment_method' => 'nullable|string',
            'cashier_id' => 'nullable|exists:users,id',
            'export' => 'nullable|boolean',
        ]);

        $startDate = $validated['start_date'] ?? now()->subDays(30)->toDateString();
        $endDate = $validated['end_date'] ?? now()->toDateString();
        $paymentMethod = $validated['payment_method'] ?? null;
        // Default to current logged-in cashier
        $cashierId = $validated['cashier_id'] ?? Auth::id();
        $export = $validated['export'] ?? false;

        // Purchases Report
        $purchasesQuery = Purchase::with([
            'buyerAccount.memberInfo:id,fname,mname,lname,MID',
            'items.product:id,sku,name,price',
        ])
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);

        if ($paymentMethod) {
            $purchasesQuery->where('payment_method', $paymentMethod);
        }

        if ($cashierId) {
            $purchasesQuery->where('cashier_id', $cashierId);
        }

        $purchases = $purchasesQuery->latest()->get()->map(function ($purchase) {
            $member = $purchase->buyerAccount?->memberInfo;
            $memberName = $member
                ? trim(($member->fname ?? '').' '.($member->mname ?? '').' '.($member->lname ?? ''))
                : 'N/A';

            return [
                'id' => $purchase->id,
                'trans_no' => $purchase->trans_no,
                'date' => optional($purchase->created_at)->format('Y-m-d H:i:s'),
                'buyer_account' => $purchase->buyerAccount?->account_name ?? 'N/A',
                'buyer_name' => $memberName,
                'buyer_mid' => $member?->MID ?? 'N/A',
                'total_amount' => $purchase->total_amount,
                'payment_method' => $purchase->payment_method,
                'paid_at' => optional($purchase->paid_at)->format('Y-m-d H:i:s'),
                'items' => $purchase->items->map(function ($item) {
                    return [
                        'product_sku' => $item->product?->sku ?? 'N/A',
                        'product_name' => $item->product?->name ?? 'N/A',
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                    ];
                })->toArray(),
            ];
        });

        // Commissions Report
        $commissionsQuery = Commission::with([
            'memberAccount.memberInfo:id,fname,mname,lname,MID',
            'purchase:id,trans_no,total_amount',
        ])
            ->whereHas('purchase', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
            });

        if ($cashierId) {
            $commissionsQuery->whereHas('purchase', function ($q) use ($cashierId) {
                $q->where('cashier_id', $cashierId);
            });
        }

        $commissions = $commissionsQuery->latest()->get()->map(function ($comm) {
            $member = $comm->memberAccount?->memberInfo;
            $memberName = $member
                ? trim(($member->fname ?? '').' '.($member->lname ?? ''))
                : 'N/A';

            return [
                'id' => $comm->id,
                'date' => optional($comm->created_at)->format('Y-m-d H:i:s'),
                'member_account' => $comm->memberAccount?->account_name ?? 'N/A',
                'member_name' => $memberName,
                'member_mid' => $member?->MID ?? 'N/A',
                'source' => $comm->source,
                'amount' => $comm->amount,
                'level' => $comm->level,
                'percent' => $comm->percent,
                'purchase_trans_no' => $comm->purchase?->trans_no ?? 'N/A',
                'purchase_amount' => $comm->purchase?->total_amount ?? 0,
                'description' => $comm->description,
            ];
        });

        // Registrations Report
        $registrationsQuery = TransactionHistory::with('memberPin.sponsorAccount.memberInfo')
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);

        if ($cashierId) {
            $registrationsQuery->where('cashier_id', $cashierId);
        }

        if ($paymentMethod) {
            $registrationsQuery->where('payment_method', $paymentMethod);
        }

        $registrations = $registrationsQuery->latest()->get()->map(function ($trans) {
            $sponsor = $trans->memberPin?->sponsorAccount?->memberInfo;
            $sponsorName = $sponsor
                ? trim(($sponsor->fname ?? '').' '.($sponsor->lname ?? ''))
                : 'N/A';

            return [
                'id' => $trans->id,
                'trans_no' => $trans->trans_no,
                'date' => optional($trans->created_at)->format('Y-m-d H:i:s'),
                'member_email' => $trans->member_email,
                'pin' => $trans->memberPin?->pin ?? 'N/A',
                'payment_method' => $trans->payment_method,
                'sponsor_name' => $sponsorName,
            ];
        });

        // Summary Statistics
        $summary = [
            'total_purchases' => $purchases->count(),
            'total_sales' => $purchases->sum('total_amount'),
            'total_commissions' => $commissions->sum('amount'),
            'total_registrations' => $registrations->count(),
            'by_payment_method' => $purchases->groupBy('payment_method')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total' => $group->sum('total_amount'),
                ];
            })->toArray(),
            'by_source' => $commissions->groupBy('source')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total' => $group->sum('amount'),
                ];
            })->toArray(),
            'top_buyers' => $purchases->groupBy('buyer_account')->map(function ($group) {
                return [
                    'buyer_name' => $group->first()['buyer_name'],
                    'buyer_mid' => $group->first()['buyer_mid'],
                    'purchase_count' => $group->count(),
                    'total_spent' => $group->sum('total_amount'),
                ];
            })->sortByDesc('total_spent')->take(10)->values()->toArray(),
            'daily_sales' => $purchases->groupBy(function ($item) {
                return substr($item['date'], 0, 10);
            })->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total' => $group->sum('total_amount'),
                ];
            })->toArray(),
        ];

        // If export is requested, return Excel
        if ($export) {
            $filename = 'cashier_report_'.date('Y-m-d_His').'.xlsx';

            return Excel::download(
                new CashierReportExport($purchases, $commissions, $registrations, $summary),
                $filename
            );
        }

        // Get payment methods
        $paymentMethods = PaymentMethod::active()->get(['id', 'name', 'code']);

        return Inertia::render('Cashier/Dashboard', [
            'showReports' => true,
            'reportData' => [
                'purchases' => $purchases,
                'commissions' => $commissions,
                'registrations' => $registrations,
                'summary' => $summary,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'payment_method' => $paymentMethod,
                ],
            ],
            'paymentMethods' => $paymentMethods,
        ]);
    }

    private function exportReportsCsv($purchases, $commissions, $summary)
    {
        $filename = 'cashier_report_'.date('Y-m-d_His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($purchases, $commissions, $summary) {
            $file = fopen('php://output', 'w');

            // Summary Section
            fputcsv($file, ['SUMMARY REPORT']);
            fputcsv($file, ['Total Purchases', $summary['total_purchases']]);
            fputcsv($file, ['Total Sales', number_format($summary['total_sales'], 2)]);
            fputcsv($file, ['Total Commissions', number_format($summary['total_commissions'], 2)]);
            fputcsv($file, []);

            // Purchases Section
            fputcsv($file, ['PURCHASES DETAIL']);
            fputcsv($file, [
                'Trans No',
                'Date',
                'Buyer Account',
                'Buyer Name',
                'Buyer MID',
                'Total Amount',
                'Payment Method',
                'Items',
            ]);

            foreach ($purchases as $purchase) {
                $items = collect($purchase['items'])->map(function ($item) {
                    return $item['product_name'].' (Qty: '.$item['quantity'].')';
                })->implode('; ');

                fputcsv($file, [
                    $purchase['trans_no'],
                    $purchase['date'],
                    $purchase['buyer_account'],
                    $purchase['buyer_name'],
                    $purchase['buyer_mid'],
                    $purchase['total_amount'],
                    $purchase['payment_method'],
                    $items,
                ]);
            }

            fputcsv($file, []);

            // Commissions Section
            fputcsv($file, ['COMMISSIONS DETAIL']);
            fputcsv($file, [
                'Date',
                'Member Account',
                'Member Name',
                'Member MID',
                'Source',
                'Amount',
                'Level',
                'Percent',
                'Purchase Trans No',
                'Description',
            ]);

            foreach ($commissions as $comm) {
                fputcsv($file, [
                    $comm['date'],
                    $comm['member_account'],
                    $comm['member_name'],
                    $comm['member_mid'],
                    $comm['source'],
                    $comm['amount'],
                    $comm['level'] ?? '',
                    $comm['percent'] ?? '',
                    $comm['purchase_trans_no'],
                    $comm['description'] ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
