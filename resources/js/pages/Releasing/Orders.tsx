import { useServerTableControls } from '@/components/data-table/use-server-table';
import MemberDataTablePage, {
    type MemberDataTableColumn,
    type SortButtonConfig,
} from '@/components/members/member-data-table-page';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { notifyError } from '@/lib/notifier';
import { cn, formatCurrency } from '@/lib/utils';
import { Paginated } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle, Package } from 'lucide-react';
import React, { useState } from 'react';

interface Order {
    id: number;
    order_number: string;
    member_account_id: number;
    account_id: string;
    member_name: string;
    total_amount: number;
    status:
        | 'pending'
        | 'for_payment'
        | 'for_release'
        | 'completed'
        | 'cancelled';
    created_at: string;
    updated_at: string;
    released_at?: string;
    received_by?: string;
    items: OrderItem[];
}

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface PageProps extends Record<string, unknown> {
    for_release_orders: Paginated<Order>;
    completed_orders: Paginated<Order>;
    filters?: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
        tab?: string;
    };
}

const ReleasingOrders: React.FC = () => {
    const { props } = usePage<PageProps>();
    const { for_release_orders, completed_orders, filters = {} } = props;

    // Enable real-time order updates
    useRealtimeOrders(['for_release_orders', 'completed_orders']);

    // Get actual counts
    const forReleaseCount =
        for_release_orders?.meta?.total ?? for_release_orders?.total ?? 0;
    const completedCount =
        completed_orders?.meta?.total ?? completed_orders?.total ?? 0;

    const [activeTab, setActiveTab] = useState<'for_release' | 'completed'>(
        (filters.tab as 'for_release' | 'completed') || 'for_release',
    );

    const { searchTerm, setSearchTerm, toggleSort, sortIndicator } =
        useServerTableControls({
            route: '/releasing/orders',
            filters,
            defaultSort: 'created_at',
            defaultDirection: 'desc',
            query: { tab: activeTab },
        });

    // Dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        orderId: number | null;
        orderNumber: string;
    }>({
        open: false,
        orderId: null,
        orderNumber: '',
    });

    const [receivedBy, setReceivedBy] = useState('');

    const handleMarkAsReleased = (orderId: number, orderNumber: string) => {
        setConfirmDialog({
            open: true,
            orderId,
            orderNumber,
        });
    };

    const confirmRelease = () => {
        if (!confirmDialog.orderId) return;

        if (!receivedBy.trim()) {
            notifyError('Please enter who received the order');
            return;
        }

        router.post(
            `/releasing/orders/${confirmDialog.orderId}/release`,
            { received_by: receivedBy },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmDialog({
                        open: false,
                        orderId: null,
                        orderNumber: '',
                    });
                    setReceivedBy('');
                },
                onError: () => {
                    setConfirmDialog({
                        open: false,
                        orderId: null,
                        orderNumber: '',
                    });
                },
            },
        );
    };

    const getStatusBadge = (status: Order['status']): React.ReactElement => {
        const variants = {
            pending: 'bg-slate-100 text-slate-700 border-slate-200',
            for_payment: 'bg-amber-50 text-amber-700 border-amber-200',
            for_release: 'bg-blue-50 text-blue-700 border-blue-200',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-red-50 text-red-600 border-red-200',
        };

        const labels = {
            pending: 'Pending',
            for_payment: 'For Payment',
            for_release: 'For Release',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };

        return (
            <span
                className={cn(
                    'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                    variants[status],
                )}
            >
                {labels[status]}
            </span>
        );
    };

    // Define columns for "For Release" tab
    const forReleaseColumns: MemberDataTableColumn<Order>[] = [
        {
            key: 'order_number',
            header: 'Order #',
            cellClassName: 'font-medium text-slate-700',
            render: (order) => order.order_number,
        },
        {
            key: 'member_name',
            header: 'Member',
            render: (order) => (
                <div>
                    <div className="font-medium">{order.member_name}</div>
                    <div className="text-xs text-slate-500">
                        {order.account_id}
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Items',
            render: (order) => (
                <div className="text-sm">
                    {order.items.map((item) => (
                        <div key={item.id}>
                            {item.product_name} x{item.quantity}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'total_amount',
            header: 'Total',
            cellClassName: 'font-semibold text-slate-700',
            render: (order) => formatCurrency(order.total_amount),
        },
        {
            key: 'status',
            header: 'Status',
            render: (order) => getStatusBadge(order.status),
        },
        {
            key: 'created_at',
            header: 'Created',
            cellClassName: 'text-slate-500',
            render: (order) => new Date(order.created_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            header: 'Action',
            render: (order) => (
                <Button
                    size="sm"
                    onClick={() =>
                        handleMarkAsReleased(order.id, order.order_number)
                    }
                >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Release
                </Button>
            ),
        },
    ];

    // Define columns for "Completed" tab
    const completedColumns: MemberDataTableColumn<Order>[] = [
        {
            key: 'order_number',
            header: 'Order #',
            cellClassName: 'font-medium text-slate-700',
            render: (order) => order.order_number,
        },
        {
            key: 'member_name',
            header: 'Member',
            render: (order) => (
                <div>
                    <div className="font-medium">{order.member_name}</div>
                    <div className="text-xs text-slate-500">
                        {order.account_id}
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Items',
            render: (order) => (
                <div className="text-sm">
                    {order.items.map((item) => (
                        <div key={item.id}>
                            {item.product_name} x{item.quantity}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'total_amount',
            header: 'Total',
            cellClassName: 'font-semibold text-slate-700',
            render: (order) => formatCurrency(order.total_amount),
        },
        {
            key: 'status',
            header: 'Status',
            render: (order) => getStatusBadge(order.status),
        },
        {
            key: 'received_by',
            header: 'Received By',
            cellClassName: 'text-slate-600',
            render: (order) => order.received_by || '-',
        },
        {
            key: 'released_at',
            header: 'Released',
            cellClassName: 'text-slate-500',
            render: (order) =>
                order.released_at
                    ? new Date(order.released_at).toLocaleDateString()
                    : '-',
        },
    ];

    const sortButtons: SortButtonConfig[] = [
        {
            key: 'created_at',
            label: 'Created',
            onClick: () => toggleSort('created_at'),
            isActive: (filters.sort ?? 'created_at') === 'created_at',
            indicator: sortIndicator('created_at'),
        },
        {
            key: 'member_name',
            label: 'Member',
            onClick: () => toggleSort('member_name'),
            isActive: filters.sort === 'member_name',
            indicator: sortIndicator('member_name'),
        },
        {
            key: 'total_amount',
            label: 'Amount',
            onClick: () => toggleSort('total_amount'),
            isActive: filters.sort === 'total_amount',
            indicator: sortIndicator('total_amount'),
        },
    ];

    // Determine which data to show based on active tab
    const currentData =
        activeTab === 'for_release' ? for_release_orders : completed_orders;
    const currentColumns =
        activeTab === 'for_release' ? forReleaseColumns : completedColumns;
    const currentTitle =
        activeTab === 'for_release'
            ? 'Orders Ready for Release'
            : 'Completed Orders';
    const currentDescription =
        activeTab === 'for_release'
            ? 'Orders that have been paid and are ready to be released to members'
            : 'Orders that have been released to members';
    const currentIcon = activeTab === 'for_release' ? Package : CheckCircle;

    return (
        <>
            <MemberDataTablePage
                headTitle="Orders - Releasing"
                pageTitle="Orders Management"
                pageDescription="View and release orders to members"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search orders, members, products..."
                tableTitle={
                    <>
                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => {
                                setActiveTab(
                                    value as 'for_release' | 'completed',
                                );
                                router.get(
                                    '/releasing/orders',
                                    {
                                        tab: value,
                                        search: searchTerm || undefined,
                                        sort: filters.sort,
                                        direction: filters.direction,
                                    },
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                            className="w-full"
                        >
                            <TabsList className="mb-4">
                                <TabsTrigger value="for_release">
                                    <Package className="mr-2 h-4 w-4" />
                                    For Release ({forReleaseCount})
                                </TabsTrigger>
                                <TabsTrigger value="completed">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Completed ({completedCount})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </>
                }
                tableDescription={currentDescription}
                sortButtons={sortButtons}
                paginated={currentData}
                emptyMessage={
                    searchTerm
                        ? 'No orders found matching your search'
                        : activeTab === 'for_release'
                          ? 'No orders ready for release'
                          : 'No completed orders'
                }
                totalLabel="orders"
                getRowKey={(order) => order.id}
                columns={currentColumns}
            />

            {/* Confirmation Dialog */}
            <AlertDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog({
                            open: false,
                            orderId: null,
                            orderNumber: '',
                        });
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
                                {confirmDialog.orderNumber}
                            </span>{' '}
                            as released? This action indicates that the products
                            have been delivered to the member.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-0 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="received_by">
                                Received By (Name)
                            </Label>
                            <Input
                                id="received_by"
                                value={receivedBy}
                                onChange={(e) => setReceivedBy(e.target.value)}
                                placeholder="Enter recipient name"
                                autoFocus
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRelease}>
                            Confirm Release
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ReleasingOrders;
