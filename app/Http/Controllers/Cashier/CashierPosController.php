<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\MemberAccount;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Services\UnilevelCommissionService;
use App\Support\IdentifierGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CashierPosController extends Controller
{
    private const LOG_FILE = 'CashierPOS_logs.log';

    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 15);

        // Get products with stock information (from inventory_products table)
        $products = \DB::table('products')
            ->leftJoin('inventory_products', 'products.id', '=', 'inventory_products.id')
            ->where('products.is_active', true)
            ->orderBy('products.name')
            ->select([
                'products.id',
                'products.sku',
                'products.name',
                'products.price',
                'inventory_products.stock_quantity',
                'inventory_products.low_stock_threshold',
            ])
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'name' => $p->name,
                'price' => $p->price,
                'stock_quantity' => $p->stock_quantity ?? 0,
                'low_stock_threshold' => $p->low_stock_threshold ?? 10,
                'is_low_stock' => ($p->stock_quantity ?? 0) <= ($p->low_stock_threshold ?? 10),
            ]);

        // Member account options for combobox
        $accounts = MemberAccount::with('memberInfo:id,fname,mname,lname,MID')
            ->orderBy('account_name')
            ->get(['id', 'account_name', 'member_id'])
            ->map(function (MemberAccount $account) {
                $member = $account->memberInfo;
                $name = $member ? trim(($member->fname ?? '').' '.($member->lname ?? '')) : null;

                return [
                    'id' => $account->id,
                    'account_name' => $account->account_name,
                    'member_name' => $name,
                    'mid' => $member->MID ?? null,
                ];
            });

        // Get orders by status for each tab with search and pagination
        $ordersByStatus = $this->getOrdersByStatus($user?->id, $search, $perPage);

        // Get payment methods
        $paymentMethods = PaymentMethod::active()->get(['id', 'name', 'code']);

        // Get low stock warnings
        $lowStockProducts = \DB::table('inventory_products')
            ->where('stock_quantity', '<=', \DB::raw('low_stock_threshold'))
            ->where('stock_quantity', '>', 0)
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'stock_quantity' => $p->stock_quantity,
                'low_stock_threshold' => $p->low_stock_threshold,
            ]);

        // Get out of stock products
        $outOfStockCount = \DB::table('inventory_products')
            ->where('stock_quantity', '<=', 0)
            ->count();

        return Inertia::render('Cashier/POS', [
            'products' => $products,
            'accounts' => $accounts,
            'orders' => $ordersByStatus,
            'paymentMethods' => $paymentMethods,
            'search' => $search,
            'inventory_warnings' => [
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_count' => $outOfStockCount,
            ],
        ]);
    }

    private function getOrdersByStatus($cashierId, $search = '', $perPage = 15)
    {
        $baseQuery = Purchase::with(['buyerAccount.memberInfo', 'items.product'])
            ->where('cashier_id', $cashierId)
            ->orderByDesc('created_at');

        // Apply search filter if provided
        if (! empty($search)) {
            $baseQuery->where(function ($query) use ($search) {
                $query->where('trans_no', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")
                    ->orWhereHas('buyerAccount.memberInfo', function ($q) use ($search) {
                        $q->where('fname', 'like', "%{$search}%")
                            ->orWhere('lname', 'like', "%{$search}%")
                            ->orWhere('MID', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items.product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        return [
            'pending' => $this->formatOrders($baseQuery->clone()->pending()->limit($perPage)->get()),
            'for_payment' => $this->formatOrders($baseQuery->clone()->forPayment()->limit($perPage)->get()),
            'for_release' => $this->formatOrders($baseQuery->clone()->forRelease()->limit($perPage)->get()),
            'completed' => $this->formatOrders($baseQuery->clone()->completed()->limit($perPage)->get()),
            'cancelled' => $this->formatOrders($baseQuery->clone()->cancelled()->limit($perPage)->get()),
        ];
    }

    private function formatOrders($orders)
    {
        return $orders->map(function (Purchase $p) {
            $acc = $p->buyerAccount;
            $member = $acc?->memberInfo;
            $memberName = $member ? trim(($member->fname ?? '').' '.($member->lname ?? '')) : $acc?->account_name;

            return [
                'id' => $p->id,
                'trans_no' => $p->trans_no,
                'member_name' => $memberName,
                'buyer_mid' => $member?->MID ?? 'N/A',
                'total_amount' => $p->total_amount,
                'payment_method' => $p->payment_method,
                'date' => optional($p->created_at)->format('Y-m-d H:i:s'),
                'paid_at' => optional($p->paid_at)->format('Y-m-d H:i:s'),
                'released_at' => optional($p->released_at)->format('Y-m-d H:i:s'),
                'received_by' => $p->received_by,
                'status' => $p->status,
                'source' => $p->source,
                'items' => $p->items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product?->name ?? 'N/A',
                        'product_sku' => $item->product?->sku ?? 'N/A',
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                    ];
                }),
            ];
        });
    }

    public function store(Request $request, UnilevelCommissionService $unilevel)
    {
        $cashierId = Auth::id();
        $this->writeControllerLog(self::LOG_FILE, 'info', 'POS sale initiated.', ['cashier_user_id' => $cashierId, 'RequestData' => $request->all()]);

        $validated = $request->validate([
            'account_name' => 'required|string',
            'payment_method' => 'required|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $this->writeControllerLog(self::LOG_FILE, 'info', 'POS sale initiated.', ['cashier_user_id' => $cashierId, 'account_name' => $validated['account_name'], 'RequestData' => $validated]);

        $account = MemberAccount::where('account_name', $validated['account_name'])->first();
        if (! $account) {
            return response()->json([
                'success' => false,
                'message' => 'Member account not found by account_name.',
            ], 422);
        }

        $products = Product::whereIn('id', collect($validated['items'])->pluck('product_id'))->get()->keyBy('id');

        $transCodes = IdentifierGenerator::generateTransactionNumber();

        $result = DB::transaction(function () use ($validated, $cashierId, $account, $products, $transCodes, $unilevel, $request) {
            $total = 0;
            foreach ($validated['items'] as $line) {
                $prod = $products[$line['product_id']] ?? null;
                if (! $prod) {
                    continue;
                }
                $total += $prod->price * (int) $line['quantity'];
            }

            $purchase = Purchase::create([
                'trans_no' => $transCodes['transaction'],
                'cashier_id' => $cashierId,
                'buyer_account_id' => $account->id,
                'total_amount' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => Purchase::STATUS_PENDING,
                'source' => Purchase::SOURCE_POS,
                'paid_at' => null,
            ]);

            foreach ($validated['items'] as $line) {
                $prod = $products[$line['product_id']] ?? null;
                if (! $prod) {
                    continue;
                }
                $qty = (int) $line['quantity'];
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $prod->id,
                    'quantity' => $qty,
                    'unit_price' => $prod->price,
                    'subtotal' => $prod->price * $qty,
                ]);
            }

            $this->writeControllerLog(self::LOG_FILE, 'info', 'Purchase recorded.', ['purchase_id' => $purchase->id, 'buyer_account_id' => $account->id, 'total' => $total]);

            // Distribute unilevel commissions and update maintenance
            $unilevel->distributeForPurchase($purchase);

            $payload = [
                'success' => true,
                'message' => 'Purchase completed successfully.',
                'data' => [
                    'purchase_id' => $purchase->id,
                    'trans_no' => $purchase->trans_no,
                    'total_amount' => $total,
                ],
            ];

            if ($request->wantsJson()) {
                return response()->json($payload, 201);
            }

            return redirect()
                ->route('cashier.pos.index')
                ->with('success', 'Purchase completed successfully.');
        });

        return $result;
    }

    /**
     * Load more orders for a specific status (for infinite scroll/pagination)
     */
    public function loadMore(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,for_payment,for_release,completed,cancelled',
            'offset' => 'required|integer|min:0',
            'limit' => 'integer|min:1|max:50',
            'search' => 'nullable|string',
        ]);

        $cashierId = Auth::id();
        $status = $validated['status'];
        $offset = $validated['offset'];
        $limit = $validated['limit'] ?? 15;
        $search = $validated['search'] ?? '';

        $query = Purchase::with(['buyerAccount.memberInfo', 'items.product'])
            ->where('cashier_id', $cashierId)
            ->orderByDesc('created_at');

        // Apply status scope
        switch ($status) {
            case 'pending':
                $query->pending();
                break;
            case 'for_payment':
                $query->forPayment();
                break;
            case 'for_release':
                $query->forRelease();
                break;
            case 'completed':
                $query->completed();
                break;
            case 'cancelled':
                $query->cancelled();
                break;
        }

        // Apply search filter
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('trans_no', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")
                    ->orWhereHas('buyerAccount.memberInfo', function ($subq) use ($search) {
                        $subq->where('fname', 'like', "%{$search}%")
                            ->orWhere('lname', 'like', "%{$search}%")
                            ->orWhere('MID', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items.product', function ($subq) use ($search) {
                        $subq->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $query->offset($offset)->limit($limit)->get();
        $hasMore = $query->offset($offset + $limit)->exists();

        return response()->json([
            'orders' => $this->formatOrders($orders),
            'hasMore' => $hasMore,
        ]);
    }
}
