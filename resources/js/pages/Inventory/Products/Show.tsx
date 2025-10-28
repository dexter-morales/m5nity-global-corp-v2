import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Product } from '@/types/inventory';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Edit,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    product: Product;
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function ShowProduct({ product, can }: Props) {
    const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'in' as 'in' | 'out' | 'adjustment',
        quantity: '1',
        notes: '',
    });

    const handleAdjustStock = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/inventory/products/${product.id}/adjust-stock`, {
            onSuccess: () => {
                setIsAdjustStockOpen(false);
                reset();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive'
        > = {
            active: 'default',
            inactive: 'secondary',
            discontinued: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title={product.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/inventory/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-muted-foreground">
                                SKU: {product.sku}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can.update && (
                            <>
                                <Dialog
                                    open={isAdjustStockOpen}
                                    onOpenChange={setIsAdjustStockOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            Adjust Stock
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Adjust Stock
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form
                                            onSubmit={handleAdjustStock}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="type">
                                                    Transaction Type
                                                </Label>
                                                <Select
                                                    value={data.type}
                                                    onValueChange={(
                                                        value:
                                                            | 'in'
                                                            | 'out'
                                                            | 'adjustment',
                                                    ) => setData('type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="in">
                                                            Stock In
                                                        </SelectItem>
                                                        <SelectItem value="out">
                                                            Stock Out
                                                        </SelectItem>
                                                        <SelectItem value="adjustment">
                                                            Adjustment
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">
                                                    Quantity
                                                </Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    min="1"
                                                    value={data.quantity}
                                                    onChange={(e) =>
                                                        setData(
                                                            'quantity',
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={errors.quantity}
                                                    required
                                                />
                                                {data.type === 'adjustment' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        For adjustments, enter
                                                        the new total quantity
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="notes">
                                                    Notes
                                                </Label>
                                                <Textarea
                                                    id="notes"
                                                    value={data.notes}
                                                    onChange={(e) =>
                                                        setData(
                                                            'notes',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setIsAdjustStockOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    {processing
                                                        ? 'Adjusting...'
                                                        : 'Adjust Stock'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Button asChild>
                                    <Link
                                        href={`/inventory/products/${product.id}/edit`}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Warnings */}
                {(product.is_low_stock ||
                    product.is_expired ||
                    product.is_expiring_soon) && (
                    <Card className="border-yellow-600">
                        <CardHeader>
                            <CardTitle className="flex items-center text-yellow-600">
                                <AlertTriangle className="mr-2 h-5 w-5" />
                                Warnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {product.is_low_stock && (
                                <div className="flex items-center gap-2 text-destructive">
                                    <TrendingDown className="h-4 w-4" />
                                    <span>
                                        Stock is below reorder level (
                                        {product.reorder_level} units)
                                    </span>
                                </div>
                            )}
                            {product.is_expired && (
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>
                                        Product has expired on{' '}
                                        {new Date(
                                            product.expiration_date!,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {product.is_expiring_soon &&
                                !product.is_expired && (
                                    <div className="flex items-center gap-2 text-yellow-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>
                                            Product expiring soon on{' '}
                                            {new Date(
                                                product.expiration_date!,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Product Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Status
                                </Label>
                                <div className="mt-1">
                                    {getStatusBadge(product.status)}
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Description
                                </Label>
                                <p className="mt-1">
                                    {product.description || 'No description'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">
                                        Price
                                    </Label>
                                    <p className="mt-1 text-lg font-semibold">
                                        ₱
                                        {parseFloat(
                                            product.price.toString(),
                                        ).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Expiration Date
                                    </Label>
                                    <p className="mt-1">
                                        {product.expiration_date
                                            ? new Date(
                                                  product.expiration_date,
                                              ).toLocaleDateString()
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">
                                        Current Stock
                                    </Label>
                                    <p className="mt-1 text-2xl font-bold">
                                        {product.stock_quantity}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Reorder Level
                                    </Label>
                                    <p className="mt-1 text-2xl font-bold">
                                        {product.reorder_level}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Total Stock Value
                                </Label>
                                <p className="mt-1 text-lg font-semibold">
                                    ₱
                                    {(
                                        product.stock_quantity *
                                        parseFloat(product.price.toString())
                                    ).toFixed(2)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Packages containing this product */}
                {product.packages && product.packages.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Included in Packages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Package Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>
                                            Quantity per Package
                                        </TableHead>
                                        <TableHead>Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.packages.map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-medium">
                                                {pkg.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {pkg.code}
                                            </TableCell>
                                            <TableCell>
                                                {pkg.pivot.quantity} units
                                            </TableCell>
                                            <TableCell>
                                                ₱
                                                {parseFloat(
                                                    pkg.price.toString(),
                                                ).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Transaction History */}
                {product.transactions && product.transactions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Previous Stock</TableHead>
                                        <TableHead>New Stock</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Created By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.transactions
                                        .slice(0, 10)
                                        .map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    {new Date(
                                                        transaction.created_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            transaction.type ===
                                                            'in'
                                                                ? 'default'
                                                                : transaction.type ===
                                                                    'out'
                                                                  ? 'destructive'
                                                                  : 'secondary'
                                                        }
                                                    >
                                                        {transaction.type ===
                                                        'in' ? (
                                                            <>
                                                                <TrendingUp className="mr-1 h-3 w-3" />{' '}
                                                                In
                                                            </>
                                                        ) : transaction.type ===
                                                          'out' ? (
                                                            <>
                                                                <TrendingDown className="mr-1 h-3 w-3" />{' '}
                                                                Out
                                                            </>
                                                        ) : (
                                                            'Adjustment'
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        transaction.previous_quantity
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.new_quantity}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {transaction.notes || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.creator
                                                        ?.name || 'System'}
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
