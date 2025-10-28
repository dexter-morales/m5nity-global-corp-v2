import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Package } from '@/types/inventory';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';

interface Props {
    package: Package;
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function ShowPackage({ package: pkg, can }: Props) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary'> = {
            active: 'default',
            inactive: 'secondary',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title={pkg.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/inventory/packages">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {pkg.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Code: {pkg.code}
                            </p>
                        </div>
                    </div>
                    {can.update && (
                        <Button asChild>
                            <Link href={`/inventory/packages/${pkg.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Package Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Status
                                </Label>
                                <div className="mt-1">
                                    {getStatusBadge(pkg.status)}
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Description
                                </Label>
                                <p className="mt-1">
                                    {pkg.description || 'No description'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Price
                                </Label>
                                <p className="mt-1 text-2xl font-bold">
                                    ₱
                                    {parseFloat(pkg.price.toString()).toFixed(
                                        2,
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Package Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Total Products
                                </Label>
                                <p className="mt-1 text-2xl font-bold">
                                    {pkg.total_products_count}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Created By
                                </Label>
                                <p className="mt-1">
                                    {pkg.creator?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">
                                    Last Updated
                                </Label>
                                <p className="mt-1">
                                    {new Date(
                                        pkg.updated_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {pkg.products && pkg.products.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Products in Package</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>
                                            Quantity per Package
                                        </TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Total Value</TableHead>
                                        <TableHead>Available Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pkg.products.map((product) => {
                                        const totalValue =
                                            product.pivot.quantity *
                                            parseFloat(
                                                product.price.toString(),
                                            );
                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {product.sku}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    {product.pivot.quantity}{' '}
                                                    units
                                                </TableCell>
                                                <TableCell>
                                                    ₱
                                                    {parseFloat(
                                                        product.price.toString(),
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    ₱{totalValue.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            product.stock_quantity <
                                                            product.pivot
                                                                .quantity
                                                                ? 'destructive'
                                                                : 'default'
                                                        }
                                                    >
                                                        {product.stock_quantity}{' '}
                                                        in stock
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
