import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    stock_quantity: number;
    reorder_level: number;
    updated_at: string;
}

interface Props {
    stats: {
        totalProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
    };
    recentProducts: Product[];
}

export default function ReleasingPersonnelDashboard({
    stats,
    recentProducts,
}: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/releasing' }]}>
            <Head title="Releasing Personnel Dashboard" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Releasing Personnel Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Inventory management and product overview
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Products
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalProducts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active inventory items
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Low Stock
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.lowStockProducts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Products below threshold
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Out of Stock
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.outOfStockProducts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Products need restock
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks for inventory management
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button asChild>
                            <Link href="/inventory/products">
                                View All Products
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/inventory/products/create">
                                Add New Product
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/inventory/packages">
                                Manage Packages
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/inventory/reports">View Reports</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Products</CardTitle>
                        <CardDescription>
                            Latest updated inventory items
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentProducts.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No products yet
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentProducts.map((product) => {
                                        const isOutOfStock =
                                            product.stock_quantity === 0;
                                        const isLowStock =
                                            product.stock_quantity <=
                                            product.reorder_level;

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    {product.stock_quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {isOutOfStock ? (
                                                        <Badge variant="destructive">
                                                            Out of Stock
                                                        </Badge>
                                                    ) : isLowStock ? (
                                                        <Badge variant="secondary">
                                                            Low Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            In Stock
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        product.updated_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
