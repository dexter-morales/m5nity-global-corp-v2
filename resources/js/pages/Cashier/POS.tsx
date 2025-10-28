import type { CartItem } from '@/components/pos/CartPanel';
import MemberSelect, { AccountOption } from '@/components/pos/MemberSelect';
import ProductCard, { Product, currency } from '@/components/pos/ProductCard';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import AppLayout from '@/layouts/app-layout';
import { notifyError, notifySuccess } from '@/lib/notifier';
import cashier from '@/routes/cashier';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    CheckCircle,
    CreditCard,
    Filter,
    ImageIcon,
    Loader2,
    Minus,
    Package,
    Plus,
    Printer,
    Search,
    ShoppingCart,
    X,
    XCircle,
} from 'lucide-react';
import React from 'react';

// Lazy load PrintReceipt component
const PrintReceipt = React.lazy(() =>
    import('@/components/pos/PrintReceipt').then((module) => ({
        default: module.PrintReceipt,
    })),
);

interface PaymentMethod {
    id: number;
    name: string;
    code: string;
}

interface OrderItem {
    product_id: number;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Order {
    id: number;
    trans_no: string;
    member_name: string;
    buyer_mid: string;
    total_amount: number;
    payment_method: string;
    date: string;
    paid_at?: string;
    released_at?: string;
    received_by?: string;
    status: string;
    source: string;
    items: OrderItem[];
}

interface PageProps extends Record<string, unknown> {
    products: Product[];
    accounts: AccountOption[];
    orders: {
        pending: Order[];
        for_payment: Order[];
        for_release: Order[];
        completed: Order[];
        cancelled: Order[];
    };
    paymentMethods: PaymentMethod[];
    search: string;
}

const PRODUCT_PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1521302080334-4bebac276872?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
];

const TAX_RATE = 0.08;

// Separate component to prevent re-creation on each render (which causes focus loss)
const OrderSearchBar: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = React.memo(({ value, onChange }) => (
    <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
            placeholder="Search orders by transaction no, member name, MID, or product..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10"
        />
    </div>
));

OrderSearchBar.displayName = 'OrderSearchBar';

// Skeleton Loaders
const ProductCardSkeleton: React.FC = () => (
    <Card className="gap-0 rounded-2xl py-0 shadow-sm">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-slate-100">
            <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
        </CardContent>
        <div className="p-4 pt-0">
            <Skeleton className="h-9 w-full rounded-md" />
        </div>
    </Card>
);

const OrderCardSkeleton: React.FC = () => (
    <Card className="mb-3">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2 text-right">
                    <Skeleton className="ml-auto h-6 w-24" />
                    <Skeleton className="ml-auto h-5 w-16" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Skeleton className="mb-2 h-4 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
            </div>
        </CardContent>
    </Card>
);

const POS: React.FC = () => {
    const { props } = usePage<PageProps>();

    // Enable real-time order updates - reload the orders prop for this page
    useRealtimeOrders(['orders']);

    const products = (props.products ?? []).map((p, index) => {
        const image =
            typeof p.imageUrl === 'string' && p.imageUrl.trim().length > 0
                ? p.imageUrl
                : PRODUCT_PLACEHOLDER_IMAGES[
                      index % PRODUCT_PLACEHOLDER_IMAGES.length
                  ];

        return {
            ...p,
            category: p.category ?? 'General',
            imageUrl: image,
        };
    });
    const accounts = props.accounts ?? [];
    const orders = React.useMemo(
        () =>
            props.orders ?? {
                pending: [],
                for_payment: [],
                for_release: [],
                completed: [],
                cancelled: [],
            },
        [props.orders],
    );
    const paymentMethods = props.paymentMethods ?? [];

    const form = useForm({
        account_name: '',
        payment_method: '',
        items: [] as { product_id: number; quantity: number }[],
    });

    const [clientErrors, setClientErrors] = React.useState<{
        account_name?: string;
        payment_method?: string;
        items?: string;
    }>({});

    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = React.useState(false);
    const [search, setSearch] = React.useState(''); // Product search
    const [category, setCategory] = React.useState('All');
    const [submitState, setSubmitState] = React.useState<
        'idle' | 'processing' | 'success'
    >('idle');

    // Simulate loading when search/category changes
    React.useEffect(() => {
        if (search || category !== 'All') {
            setIsLoadingProducts(true);
            const timer = setTimeout(() => setIsLoadingProducts(false), 300);
            return () => clearTimeout(timer);
        }
    }, [search, category]);

    // Modal states
    const [paymentModal, setPaymentModal] = React.useState<{
        open: boolean;
        order: Order | null;
    }>({ open: false, order: null });
    const [releaseModal, setReleaseModal] = React.useState<{
        open: boolean;
        order: Order | null;
    }>({ open: false, order: null });
    const [receivedBy, setReceivedBy] = React.useState('');
    const [printReceipt, setPrintReceipt] = React.useState<{
        open: boolean;
        order: Order | null;
    }>({ open: false, order: null });

    // Orders search and pagination
    const [orderSearch, setOrderSearch] = React.useState(props.search || '');
    const [loadingMore, setLoadingMore] = React.useState<
        Record<string, boolean>
    >({});
    const [ordersList, setOrdersList] = React.useState(orders);
    const [hasMore, setHasMore] = React.useState<Record<string, boolean>>({
        pending: orders.pending.length >= 15,
        for_payment: orders.for_payment.length >= 15,
        for_release: orders.for_release.length >= 15,
        completed: orders.completed.length >= 15,
        cancelled: orders.cancelled.length >= 15,
    });

    // Loading states
    const [isLoadingProducts, setIsLoadingProducts] = React.useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = React.useState(false);

    // Sync ordersList with props.orders when search results arrive
    React.useEffect(() => {
        setOrdersList(orders);
        setHasMore({
            pending: orders.pending.length >= 15,
            for_payment: orders.for_payment.length >= 15,
            for_release: orders.for_release.length >= 15,
            completed: orders.completed.length >= 15,
            cancelled: orders.cancelled.length >= 15,
        });
    }, [orders]);

    const filtered = React.useMemo(() => {
        const qs = search.trim().toLowerCase();
        return products.filter(
            (p) =>
                (category === 'All' || p.category === category) &&
                (p.name.toLowerCase().includes(qs) ||
                    p.sku.toLowerCase().includes(qs)),
        );
    }, [products, search, category]);

    const totalItems = cart.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = cart.reduce(
        (sum, it) => sum + it.product.price * it.quantity,
        0,
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const exists = prev.find((i) => i.product.id === product.id);
            if (exists) {
                return prev.map((i) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i,
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        notifySuccess('Item added to cart');
    };

    const updateQty = (productId: number, qty: number) =>
        setCart((prev) => {
            if (qty <= 0) return prev.filter((i) => i.product.id !== productId);
            return prev.map((i) =>
                i.product.id === productId ? { ...i, quantity: qty } : i,
            );
        });
    const removeItem = (productId: number) =>
        setCart((prev) => prev.filter((i) => i.product.id !== productId));
    const clearCart = () => setCart([]);

    const validate = (): boolean => {
        const errs: {
            account_name?: string;
            payment_method?: string;
            items?: string;
        } = {};
        const hasMember = !!form.data.account_name;
        if (!hasMember) errs.account_name = 'Member account is required.';
        else if (
            !accounts.find((a) => a.account_name === form.data.account_name)
        ) {
            errs.account_name = 'Select a valid member account.';
        }

        const pm = form.data.payment_method?.trim();
        if (!pm) errs.payment_method = 'Payment method is required.';

        if (cart.length === 0) errs.items = 'Items field is required.';
        if (cart.some((i) => i.quantity <= 0))
            errs.items = 'Item quantities must be at least 1.';

        setClientErrors(errs);
        if (errs.account_name) notifyError(errs.account_name);
        else if (errs.payment_method) notifyError(errs.payment_method);
        else if (errs.items) notifyError(errs.items);
        return Object.keys(errs).length === 0;
    };

    const checkout = () => {
        if (!validate()) return;

        const items = cart.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
        }));
        form.transform((data) => ({ ...data, items }));
        setSubmitState('processing');
        form.post(cashier.pos.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitState('success');
                notifySuccess('Order created successfully!');
                clearCart();
                setCartOpen(false);
                form.reset();
            },
            onError: (errors) => {
                const first = Object.values(errors)[0] as string | undefined;
                if (first) notifyError(first);
            },
            onFinish: () => {
                setTimeout(() => setSubmitState('idle'), 800);
            },
        });
    };

    const moveToPayment = (orderId: number) => {
        router.post(
            `/cashier/orders/${orderId}/move-to-payment`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    notifySuccess('Order moved to payment queue');
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to move order');
                },
            },
        );
    };

    const markAsPaid = () => {
        if (!paymentModal.order) return;

        router.post(
            `/cashier/orders/${paymentModal.order.id}/mark-as-paid`,
            {
                payment_method: paymentModal.order.payment_method,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    notifySuccess('Order marked as paid');
                    setPaymentModal({ open: false, order: null });
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to mark as paid');
                },
            },
        );
    };

    const markAsReleased = () => {
        if (!releaseModal.order || !receivedBy.trim()) {
            notifyError('Please enter who received the order');
            return;
        }

        router.post(
            `/cashier/orders/${releaseModal.order.id}/mark-as-released`,
            {
                received_by: receivedBy,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    notifySuccess('Order released successfully');
                    setReleaseModal({ open: false, order: null });
                    setReceivedBy('');
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to release order');
                },
            },
        );
    };

    const cancelOrder = (orderId: number) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        router.post(
            `/cashier/orders/${orderId}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    notifySuccess('Order cancelled');
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to cancel order');
                },
            },
        );
    };

    const fetchOrderForPrint = async (orderId: number) => {
        try {
            const response = await axios.get(`/cashier/orders/${orderId}`);
            setPrintReceipt({ open: true, order: response.data });
        } catch {
            notifyError('Failed to load order details');
        }
    };

    // Handle order search
    const handleOrderSearch = React.useCallback((value: string) => {
        setOrderSearch(value);
        setIsLoadingOrders(true);
        router.get(
            '/cashier/pos',
            { search: value },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoadingOrders(false),
            },
        );
    }, []);

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (orderSearch !== props.search) {
                handleOrderSearch(orderSearch);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [orderSearch, props.search, handleOrderSearch]);

    // Load more orders for a specific status
    const loadMoreOrders = async (status: string) => {
        if (loadingMore[status]) return;

        setLoadingMore((prev) => ({ ...prev, [status]: true }));

        try {
            const response = await axios.post('/cashier/pos/load-more', {
                status,
                offset: ordersList[status as keyof typeof ordersList].length,
                limit: 15,
                search: orderSearch,
            });

            setOrdersList((prev) => ({
                ...prev,
                [status]: [
                    ...prev[status as keyof typeof prev],
                    ...response.data.orders,
                ],
            }));

            setHasMore((prev) => ({
                ...prev,
                [status]: response.data.hasMore,
            }));
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            notifyError(
                error.response?.data?.message || 'Failed to load more orders',
            );
        } finally {
            setLoadingMore((prev) => ({ ...prev, [status]: false }));
        }
    };

    const categories = [
        'All',
        ...Array.from(new Set(products.map((p) => p.category || 'General'))),
    ];

    const OrderCard = ({ order }: { order: Order }) => (
        <Card className="mb-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg">
                            {order.trans_no}
                        </CardTitle>
                        <p className="text-xs text-gray-600 sm:text-sm">
                            {order.member_name} ({order.buyer_mid})
                        </p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
                        <p className="text-base font-bold sm:text-lg">
                            ₱{order.total_amount.toLocaleString()}
                        </p>
                        <span
                            className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                order.source === 'POS'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                            }`}
                        >
                            {order.source}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-xs sm:text-sm">
                        <span className="font-medium">Payment:</span>{' '}
                        {order.payment_method}
                    </p>
                    <div className="max-h-32 space-y-1 overflow-y-auto">
                        {order.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-xs sm:text-sm"
                            >
                                <span className="truncate pr-2">
                                    {item.product_name} x{item.quantity}
                                </span>
                                <span className="shrink-0">
                                    ₱{item.subtotal.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const LoadMoreButton = ({ status }: { status: string }) => {
        if (!hasMore[status]) return null;

        return (
            <div className="mt-4 flex justify-center">
                <Button
                    variant="outline"
                    onClick={() => loadMoreOrders(status)}
                    disabled={loadingMore[status]}
                >
                    {loadingMore[status] ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        'Load More'
                    )}
                </Button>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Cashier POS" />

            <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
                <header>
                    <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                        Cashier POS
                    </h1>
                    <p className="text-xs text-slate-500 sm:text-sm">
                        Manage orders from creation to delivery
                    </p>
                </header>

                <Tabs defaultValue="ordering" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 gap-1 sm:grid-cols-6 sm:gap-0">
                        <TabsTrigger
                            value="ordering"
                            className="cursor-pointer text-xs transition-all duration-200 sm:text-sm"
                        >
                            <ShoppingCart className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 sm:mr-2" />
                            <span className="hidden sm:inline">Ordering</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="cursor-pointer text-xs transition-all duration-200 sm:text-sm"
                        >
                            <span className="hidden sm:inline">Pending</span>
                            <span className="inline sm:hidden">Pend.</span>
                            {ordersList.pending.length > 0 && (
                                <span className="bounce ml-2 animate-in rounded-full bg-yellow-500 px-2 py-0.5 text-xs text-white zoom-in-50">
                                    {ordersList.pending.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="for_payment"
                            className="cursor-pointer text-xs transition-all duration-200 sm:text-sm"
                        >
                            <span className="hidden sm:inline">
                                For Payment
                            </span>
                            <span className="inline sm:hidden">Payment</span>
                            {ordersList.for_payment.length > 0 && (
                                <span className="bounce ml-2 animate-in rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white zoom-in-50">
                                    {ordersList.for_payment.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="for_release"
                            className="cursor-pointer text-xs transition-all duration-200 sm:text-sm"
                        >
                            <span className="hidden sm:inline">Releasing</span>
                            <span className="inline sm:hidden">Release</span>
                            {ordersList.for_release.length > 0 && (
                                <span className="bounce ml-2 animate-in rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white zoom-in-50">
                                    {ordersList.for_release.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="completed"
                            className="cursor-pointer text-xs transition-all duration-200 sm:text-sm"
                        >
                            <span className="hidden sm:inline">Completed</span>
                            <span className="inline sm:hidden">Done</span>
                            {ordersList.completed.length > 0 && (
                                <span className="bounce ml-2 animate-in rounded-full bg-green-500 px-2 py-0.5 text-xs text-white zoom-in-50">
                                    {ordersList.completed.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="cancelled"
                            className="cursor-pointer text-xs transition-all duration-200 sm:text-sm"
                        >
                            <span className="hidden sm:inline">Cancelled</span>
                            <span className="inline sm:hidden">Cancel</span>
                            {ordersList.cancelled.length > 0 && (
                                <span className="bounce ml-2 animate-in rounded-full bg-red-500 px-2 py-0.5 text-xs text-white zoom-in-50">
                                    {ordersList.cancelled.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Shopping Cart */}
                    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                        <SheetTrigger asChild>
                            <button
                                className="fixed right-4 bottom-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-xl focus:ring-4 focus:ring-ring focus:outline-none sm:right-6 sm:bottom-6 sm:h-14 sm:w-14"
                                aria-label="Open cart"
                            >
                                <ShoppingCart className="h-6 w-6 transition-transform duration-300" />
                                {totalItems > 0 && (
                                    <span className="bounce absolute -top-1 -right-1 flex h-6 w-6 animate-in items-center justify-center rounded-full bg-destructive text-xs font-bold text-white shadow-md zoom-in-50">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </SheetTrigger>

                        <SheetContent className="flex w-full flex-col px-4 pb-4 sm:max-w-lg sm:px-5 sm:pb-5">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Cart ({totalItems})
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto py-4">
                                {cart.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                                        <ShoppingCart className="mb-3 h-16 w-16 opacity-20" />
                                        <p className="text-sm">
                                            Your cart is empty
                                        </p>
                                        <p className="text-xs">
                                            Add products to get started
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 overflow-x-hidden sm:space-y-3">
                                        {cart.map((item, index) => (
                                            <div
                                                key={item.product.id}
                                                className="flex animate-in gap-2 rounded-lg border bg-white p-2 shadow-sm transition-all duration-300 fade-in slide-in-from-right hover:scale-[1.02] hover:shadow-md sm:gap-3 sm:p-3"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:h-16 sm:w-16">
                                                    {item.product.imageUrl ? (
                                                        <img
                                                            src={
                                                                item.product
                                                                    .imageUrl
                                                            }
                                                            alt={
                                                                item.product
                                                                    .name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-semibold text-slate-800">
                                                                {
                                                                    item.product
                                                                        .name
                                                                }
                                                            </h4>
                                                            <p className="text-xs text-slate-500">
                                                                {currency(
                                                                    item.product
                                                                        .price,
                                                                )}{' '}
                                                                each
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                removeItem(
                                                                    item.product
                                                                        .id,
                                                                )
                                                            }
                                                            className="text-slate-400 transition-all duration-200 hover:scale-125 hover:rotate-90 hover:text-red-600"
                                                            aria-label="Remove item"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    updateQty(
                                                                        item
                                                                            .product
                                                                            .id,
                                                                        item.quantity -
                                                                            1,
                                                                    )
                                                                }
                                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border bg-slate-50 text-slate-600 transition-all duration-200 hover:scale-110 hover:border-slate-300 hover:bg-slate-100 active:scale-95"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium transition-all duration-200">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    updateQty(
                                                                        item
                                                                            .product
                                                                            .id,
                                                                        item.quantity +
                                                                            1,
                                                                    )
                                                                }
                                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border bg-slate-50 text-slate-600 transition-all duration-200 hover:scale-110 hover:border-slate-300 hover:bg-slate-100 active:scale-95"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {currency(
                                                                item.product
                                                                    .price *
                                                                    item.quantity,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="space-y-3 border-t pt-3 sm:space-y-4 sm:pt-4">
                                    {/* Member Account and Payment Method */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <MemberSelect
                                            accounts={accounts}
                                            value={form.data.account_name}
                                            onChange={(v) => {
                                                setClientErrors((e) => ({
                                                    ...e,
                                                    account_name: undefined,
                                                }));
                                                form.setData('account_name', v);
                                            }}
                                            error={
                                                clientErrors.account_name ||
                                                (form.errors.account_name as
                                                    | string
                                                    | undefined)
                                            }
                                        />
                                        <div>
                                            <Label className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm">
                                                Payment Method
                                            </Label>
                                            <Select
                                                value={form.data.payment_method}
                                                onValueChange={(value) => {
                                                    setClientErrors((er) => ({
                                                        ...er,
                                                        payment_method:
                                                            undefined,
                                                    }));
                                                    form.setData(
                                                        'payment_method',
                                                        value,
                                                    );
                                                }}
                                            >
                                                <SelectTrigger
                                                    className={
                                                        clientErrors.payment_method
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                >
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentMethods.map(
                                                        (pm) => (
                                                            <SelectItem
                                                                key={pm.id}
                                                                value={pm.name}
                                                            >
                                                                {pm.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {clientErrors.payment_method && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        clientErrors.payment_method
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="flex justify-between text-slate-600">
                                            <span>Subtotal</span>
                                            <span>{currency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>
                                                Tax (
                                                {(TAX_RATE * 100).toFixed(0)}
                                                %)
                                            </span>
                                            <span>{currency(tax)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-800 sm:text-base">
                                            <span>Total</span>
                                            <span>{currency(total)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2 sm:mt-4">
                                        <Button
                                            onClick={checkout}
                                            disabled={
                                                form.processing ||
                                                submitState !== 'idle'
                                            }
                                            className="w-full text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
                                        >
                                            <CreditCard className="mr-2 h-3 w-3 transition-transform duration-300 group-hover:scale-110 sm:h-4 sm:w-4" />
                                            {submitState === 'processing'
                                                ? 'Processing...'
                                                : submitState === 'success'
                                                  ? '✓ Success!'
                                                  : 'Create Order'}
                                        </Button>
                                        <Button
                                            onClick={clearCart}
                                            variant="outline"
                                            className="w-full text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
                                            disabled={form.processing}
                                        >
                                            Clear Cart
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>

                    {/* ORDERING TAB */}
                    <TabsContent
                        value="ordering"
                        className="animate-in space-y-4 duration-300 fade-in slide-in-from-bottom-4"
                    >
                        {/* Catalog */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                                    🔎
                                </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Filter className="size-4 shrink-0 text-slate-500" />
                                <select
                                    className="w-full rounded-md border px-3 py-2 text-sm sm:w-auto"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="xs:grid-cols-2 grid max-h-156 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {isLoadingProducts ? (
                                // Show skeleton loaders while products are loading
                                <>
                                    {Array.from({ length: 10 }).map(
                                        (_, index) => (
                                            <ProductCardSkeleton key={index} />
                                        ),
                                    )}
                                </>
                            ) : (
                                <>
                                    {filtered.map((p, index) => (
                                        <div
                                            key={p.id}
                                            className="animate-in fade-in slide-in-from-bottom-4"
                                            style={{
                                                animationDelay: `${index * 30}ms`,
                                            }}
                                        >
                                            <ProductCard
                                                product={p}
                                                onAdd={addToCart}
                                            />
                                        </div>
                                    ))}
                                    {filtered.length === 0 && (
                                        <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                                            No products match your search.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </TabsContent>

                    {/* PENDING TAB */}
                    <TabsContent
                        value="pending"
                        className="animate-in space-y-4 duration-300 fade-in slide-in-from-bottom-4"
                    >
                        <OrderSearchBar
                            value={orderSearch}
                            onChange={setOrderSearch}
                        />
                        {isLoadingOrders ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <OrderCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : ordersList.pending.length === 0 ? (
                            <div className="flex h-96 flex-col items-center justify-center text-center text-gray-400">
                                <ShoppingCart className="mb-4 h-16 w-16 opacity-20" />
                                <p>No pending orders</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {ordersList.pending.map((order, index) => (
                                        <div
                                            key={order.id}
                                            className="animate-in fade-in slide-in-from-bottom-4"
                                            style={{
                                                animationDelay: `${index * 50}ms`,
                                            }}
                                        >
                                            <OrderCard order={order} />
                                            <div className="mt-2 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        moveToPayment(order.id)
                                                    }
                                                    className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                                                >
                                                    Move to Payment
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        cancelOrder(order.id)
                                                    }
                                                    className="transition-all duration-200 hover:scale-110 active:scale-95"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <LoadMoreButton status="pending" />
                            </>
                        )}
                    </TabsContent>

                    {/* FOR PAYMENT TAB */}
                    <TabsContent
                        value="for_payment"
                        className="animate-in space-y-4 duration-300 fade-in slide-in-from-bottom-4"
                    >
                        <OrderSearchBar
                            value={orderSearch}
                            onChange={setOrderSearch}
                        />
                        {isLoadingOrders ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <OrderCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : ordersList.for_payment.length === 0 ? (
                            <div className="flex h-96 flex-col items-center justify-center text-center text-gray-400">
                                <CreditCard className="mb-4 h-16 w-16 opacity-20" />
                                <p>No orders awaiting payment</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {ordersList.for_payment.map(
                                        (order, index) => (
                                            <div
                                                key={order.id}
                                                className="animate-in fade-in slide-in-from-bottom-4"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                <OrderCard order={order} />
                                                <div className="mt-2 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            setPaymentModal({
                                                                open: true,
                                                                order,
                                                            })
                                                        }
                                                        className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark as Paid
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            cancelOrder(
                                                                order.id,
                                                            )
                                                        }
                                                        className="transition-all duration-200 hover:scale-110 active:scale-95"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                                <LoadMoreButton status="for_payment" />
                            </>
                        )}
                    </TabsContent>

                    {/* FOR RELEASE TAB */}
                    <TabsContent
                        value="for_release"
                        className="animate-in space-y-4 duration-300 fade-in slide-in-from-bottom-4"
                    >
                        <OrderSearchBar
                            value={orderSearch}
                            onChange={setOrderSearch}
                        />
                        {isLoadingOrders ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <OrderCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : ordersList.for_release.length === 0 ? (
                            <div className="flex h-96 flex-col items-center justify-center text-center text-gray-400">
                                <Package className="mb-4 h-16 w-16 opacity-20" />
                                <p>No orders ready for release</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {ordersList.for_release.map(
                                        (order, index) => (
                                            <div
                                                key={order.id}
                                                className="animate-in fade-in slide-in-from-bottom-4"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                <OrderCard order={order} />
                                                <div className="mt-2 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            setReleaseModal({
                                                                open: true,
                                                                order,
                                                            })
                                                        }
                                                        className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                                                    >
                                                        <Package className="mr-2 h-4 w-4" />
                                                        Release Order
                                                    </Button>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                                <LoadMoreButton status="for_release" />
                            </>
                        )}
                    </TabsContent>

                    {/* COMPLETED TAB */}
                    <TabsContent
                        value="completed"
                        className="animate-in space-y-4 duration-300 fade-in slide-in-from-bottom-4"
                    >
                        <OrderSearchBar
                            value={orderSearch}
                            onChange={setOrderSearch}
                        />
                        {isLoadingOrders ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <OrderCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : ordersList.completed.length === 0 ? (
                            <div className="flex h-96 flex-col items-center justify-center text-center text-gray-400">
                                <CheckCircle className="mb-4 h-16 w-16 opacity-20" />
                                <p>No completed orders yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {ordersList.completed.map(
                                        (order, index) => (
                                            <div
                                                key={order.id}
                                                className="animate-in fade-in slide-in-from-bottom-4"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                <OrderCard order={order} />
                                                <div className="mt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            fetchOrderForPrint(
                                                                order.id,
                                                            )
                                                        }
                                                        className="w-full transition-all duration-200 hover:scale-105 active:scale-95"
                                                    >
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Print Receipt
                                                    </Button>
                                                </div>
                                                {order.received_by && (
                                                    <p className="mt-2 animate-in text-xs text-gray-600 fade-in">
                                                        Received by:{' '}
                                                        {order.received_by}
                                                    </p>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                                <LoadMoreButton status="completed" />
                            </>
                        )}
                    </TabsContent>

                    {/* CANCELLED TAB */}
                    <TabsContent
                        value="cancelled"
                        className="animate-in space-y-4 duration-300 fade-in slide-in-from-bottom-4"
                    >
                        <OrderSearchBar
                            value={orderSearch}
                            onChange={setOrderSearch}
                        />
                        {isLoadingOrders ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <OrderCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : ordersList.cancelled.length === 0 ? (
                            <div className="flex h-96 flex-col items-center justify-center text-center text-gray-400">
                                <XCircle className="mb-4 h-16 w-16 opacity-20" />
                                <p>No cancelled orders</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {ordersList.cancelled.map(
                                        (order, index) => (
                                            <div
                                                key={order.id}
                                                className="animate-in opacity-60 fade-in slide-in-from-bottom-4"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                <OrderCard order={order} />
                                            </div>
                                        ),
                                    )}
                                </div>
                                <LoadMoreButton status="cancelled" />
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Payment Confirmation Modal */}
            <Dialog
                open={paymentModal.open}
                onOpenChange={(open) =>
                    setPaymentModal({ open, order: paymentModal.order })
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                    </DialogHeader>
                    {paymentModal.order && (
                        <div className="space-y-4">
                            <p>
                                Confirm that payment has been received for order{' '}
                                <strong>{paymentModal.order.trans_no}</strong>?
                            </p>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm">
                                    <span className="font-medium">Amount:</span>{' '}
                                    ₱
                                    {paymentModal.order.total_amount.toLocaleString()}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Method:</span>{' '}
                                    {paymentModal.order.payment_method}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setPaymentModal({ open: false, order: null })
                            }
                        >
                            Cancel
                        </Button>
                        <Button onClick={markAsPaid}>Confirm Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Release Modal */}
            <AlertDialog
                open={releaseModal.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setReleaseModal({ open: false, order: null });
                        setReceivedBy('');
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirm Order Release
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark order{' '}
                            <span className="font-semibold">
                                {releaseModal.order?.trans_no}
                            </span>{' '}
                            as released? This action indicates that the products
                            have been delivered to the member.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-0 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="received_by_cashier">
                                Received By (Name)
                            </Label>
                            <Input
                                id="received_by_cashier"
                                value={receivedBy}
                                onChange={(e) => setReceivedBy(e.target.value)}
                                placeholder="Enter recipient name"
                                autoFocus
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={markAsReleased}>
                            Confirm Release
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Print Receipt Modal */}
            <React.Suspense
                fallback={
                    <Dialog open={printReceipt.open}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Loading Receipt...</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 p-6">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-48 w-full" />
                            </div>
                        </DialogContent>
                    </Dialog>
                }
            >
                <PrintReceipt
                    order={printReceipt.order}
                    open={printReceipt.open}
                    onOpenChange={(open) =>
                        setPrintReceipt({ open, order: printReceipt.order })
                    }
                />
            </React.Suspense>
        </AppLayout>
    );
};

export default POS;
