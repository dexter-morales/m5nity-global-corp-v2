import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    InventoryStatistics,
    InventoryTransaction,
    Product,
} from '@/types/inventory';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Download,
    FileSpreadsheet,
    FileText,
    PackageIcon,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    statistics: InventoryStatistics;
    lowStockProducts: Product[];
    expiredProducts: Product[];
    expiringSoonProducts: Product[];
    fastMovingProducts: Product[];
    slowMovingProducts: Product[];
    stockMovements: InventoryTransaction[];
    products: Product[];
    filters: {
        start_date: string;
        end_date: string;
        product_id?: number;
        days: number;
    };
}

export default function InventoryReports({
    statistics,
    lowStockProducts,
    expiredProducts,
    expiringSoonProducts,
    fastMovingProducts,
    slowMovingProducts,
    stockMovements,
    products,
    filters,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [productId, setProductId] = useState(
        filters.product_id?.toString() || 'all',
    );
    const [days, setDays] = useState(filters.days.toString());

    const handleFilter = () => {
        router.get(
            '/inventory/reports',
            {
                start_date: startDate,
                end_date: endDate,
                product_id: productId !== 'all' ? productId : undefined,
                days,
            },
            { preserveState: true },
        );
    };

    const handleExport = (
        format: 'csv' | 'excel' | 'pdf',
        type: string = 'summary',
    ) => {
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            type,
        });

        const routes: Record<string, string> = {
            csv: '/inventory/reports/export/csv',
            excel: '/inventory/reports/export/excel',
            pdf: '/inventory/reports/export/pdf',
        };

        window.location.href = routes[format] + '?' + params.toString();
    };

    return (
        <AppLayout>
            <Head title="Inventory Reports" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Inventory Reports
                        </h1>
                        <p className="text-muted-foreground">
                            Analytics and insights for your inventory
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleExport('csv')}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport('excel')}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport('pdf')}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Select
                                    value={productId}
                                    onValueChange={setProductId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Products" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Products
                                        </SelectItem>
                                        {products.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={product.id.toString()}
                                            >
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Days Period</Label>
                                <Select value={days} onValueChange={setDays}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">
                                            7 Days
                                        </SelectItem>
                                        <SelectItem value="30">
                                            30 Days
                                        </SelectItem>
                                        <SelectItem value="60">
                                            60 Days
                                        </SelectItem>
                                        <SelectItem value="90">
                                            90 Days
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleFilter}
                                    className="w-full"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Products
                            </CardTitle>
                            <PackageIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.total_products}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Stock Value
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱{statistics.total_stock_value.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Low Stock Items
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                {statistics.low_stock_count}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Expiring Soon
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {statistics.expiring_soon_count}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stock Movement Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Movement (Period)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Stock In
                                </Label>
                                <p className="flex items-center text-2xl font-bold text-green-600">
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    {statistics.stock_in_count}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Stock Out
                                </Label>
                                <p className="flex items-center text-2xl font-bold text-destructive">
                                    <TrendingDown className="mr-2 h-5 w-5" />
                                    {statistics.stock_out_count}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Net Change
                                </Label>
                                <p
                                    className={`text-2xl font-bold ${statistics.net_stock_change >= 0 ? 'text-green-600' : 'text-destructive'}`}
                                >
                                    {statistics.net_stock_change > 0 ? '+' : ''}
                                    {statistics.net_stock_change}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Fast Moving Products */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Fast Moving Products</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('excel', 'fast_moving')
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Units Sold</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fastMovingProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                className="text-center text-muted-foreground"
                                            >
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fastMovingProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="default">
                                                        {product.total_moved ||
                                                            0}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Slow Moving Products */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Slow Moving Products</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('excel', 'slow_moving')
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Units Sold</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {slowMovingProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                className="text-center text-muted-foreground"
                                            >
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        slowMovingProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {product.total_moved ||
                                                            0}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Low Stock Products */}
                {lowStockProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Low Stock Alert</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('excel', 'low_stock')
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Current Stock</TableHead>
                                        <TableHead>Reorder Level</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStockProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-mono text-sm">
                                                {product.sku}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="font-semibold text-destructive">
                                                {product.stock_quantity}
                                            </TableCell>
                                            <TableCell>
                                                {product.reorder_level}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">
                                                    Low Stock
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Expiring Products */}
                {(expiredProducts.length > 0 ||
                    expiringSoonProducts.length > 0) && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Expiration Alerts</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('excel', 'expiration')
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Expiration Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expiredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-mono text-sm">
                                                {product.sku}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                {product.stock_quantity}
                                            </TableCell>
                                            <TableCell>
                                                {product.expiration_date
                                                    ? new Date(
                                                          product.expiration_date,
                                                      ).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">
                                                    Expired
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {expiringSoonProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-mono text-sm">
                                                {product.sku}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                {product.stock_quantity}
                                            </TableCell>
                                            <TableCell>
                                                {product.expiration_date
                                                    ? new Date(
                                                          product.expiration_date,
                                                      ).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="border-yellow-600 text-yellow-600"
                                                >
                                                    Expiring Soon
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
