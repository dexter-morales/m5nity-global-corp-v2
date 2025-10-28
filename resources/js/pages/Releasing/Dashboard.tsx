import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, usePage } from '@inertiajs/react';
import { Package, ShoppingCart, Ticket, TrendingUp } from 'lucide-react';
import React from 'react';

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    account_id: string;
    first_name: string;
    last_name: string;
}

interface LowStockProduct {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
}

interface PageProps extends Record<string, unknown> {
    orders_for_release: Order[];
    released_today: number;
    pending_release_count: number;
    inventory_warnings: {
        low_stock_products: LowStockProduct[];
        out_of_stock_count: number;
    };
}

const ReleasingDashboard: React.FC = () => {
    const { props } = usePage<{ props: PageProps }>();
    const {
        orders_for_release = [],
        released_today = 0,
        pending_release_count = 0,
        inventory_warnings,
    } = props;

    // Enable real-time order updates
    useRealtimeOrders([
        'orders_for_release',
        'pending_release_count',
        'released_today',
    ]);

    return (
        <AppLayout>
            <Head title="Releasing Dashboard" />
            <div className="space-y-6 p-6">
                <header>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Releasing Dashboard
                    </h1>
                    <p className="text-sm text-slate-500">
                        Manage product releases and inventory
                    </p>
                </header>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Release
                            </CardTitle>
                            <Package className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pending_release_count}
                            </div>
                            <p className="text-xs text-slate-500">
                                Orders ready for release
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Released Today
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {released_today}
                            </div>
                            <p className="text-xs text-slate-500">
                                Orders completed today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Out of Stock
                            </CardTitle>
                            <Package className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {inventory_warnings.out_of_stock_count}
                            </div>
                            <p className="text-xs text-slate-500">
                                Products need restocking
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Access main functions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button asChild variant="default">
                            <Link href="/releasing/orders">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                View Orders
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/releasing/registrations">
                                <Ticket className="mr-2 h-4 w-4" />
                                View Registrations
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/inventory/products">
                                <Package className="mr-2 h-4 w-4" />
                                Check Inventory
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Orders Ready for Release */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders Ready for Release</CardTitle>
                        <CardDescription>
                            Recent orders pending product release
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {orders_for_release.length === 0 ? (
                            <div className="py-8 text-center text-slate-500">
                                No orders pending release
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {orders_for_release.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between border-b pb-2 last:border-0"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {order.order_number}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {order.first_name}{' '}
                                                {order.last_name} (
                                                {order.account_id})
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                For Release
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link href="/releasing/orders">
                                            View All Orders
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                {inventory_warnings.low_stock_products.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-amber-600">
                                Low Stock Alert
                            </CardTitle>
                            <CardDescription>
                                Products running low on stock
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {inventory_warnings.low_stock_products.map(
                                    (product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between border-b pb-2 last:border-0"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    SKU: {product.sku}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="destructive">
                                                    {product.stock_quantity}{' '}
                                                    left
                                                </Badge>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};

export default ReleasingDashboard;
