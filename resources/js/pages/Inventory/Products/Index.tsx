import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { PaginatedData, Product } from '@/types/inventory';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Edit,
    Eye,
    MoreVertical,
    Package as PackageIcon,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    products: PaginatedData<Product>;
    filters: {
        search?: string;
        status?: string;
        stock_filter?: string;
        expiration_filter?: string;
    };
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

export default function ProductsIndex({ products, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [stockFilter, setStockFilter] = useState(
        filters.stock_filter || 'all',
    );
    const [expirationFilter, setExpirationFilter] = useState(
        filters.expiration_filter || 'all',
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/inventory/products',
            {
                search,
                status: status !== 'all' ? status : undefined,
                stock_filter: stockFilter !== 'all' ? stockFilter : undefined,
                expiration_filter:
                    expirationFilter !== 'all' ? expirationFilter : undefined,
            },
            { preserveState: true },
        );
    };

    const handleDelete = (product: Product) => {
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            router.delete(`/inventory/products/${product.id}`);
        }
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
            <Head title="Products" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">
                            Products
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage your inventory products
                        </p>
                    </div>
                    {can.create && (
                        <Button asChild>
                            <Link href="/inventory/products/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Search by name or SKU..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                        <SelectItem value="discontinued">
                                            Discontinued
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={stockFilter}
                                    onValueChange={setStockFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Stock Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Stock
                                        </SelectItem>
                                        <SelectItem value="low">
                                            Low Stock
                                        </SelectItem>
                                        <SelectItem value="out">
                                            Out of Stock
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={expirationFilter}
                                    onValueChange={setExpirationFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Expiration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="expired">
                                            Expired
                                        </SelectItem>
                                        <SelectItem value="expiring_soon">
                                            Expiring Soon
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expiration</TableHead>
                                    <TableHead>Warnings</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-8 text-center"
                                        >
                                            <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-2 text-muted-foreground">
                                                No products found
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.data.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-mono text-sm">
                                                {product.sku}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={
                                                            product.is_low_stock
                                                                ? 'font-semibold text-destructive'
                                                                : ''
                                                        }
                                                    >
                                                        {product.stock_quantity}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        /{' '}
                                                        {product.reorder_level}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                ₱
                                                {parseFloat(
                                                    product.price.toString(),
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(product.status)}
                                            </TableCell>
                                            <TableCell>
                                                {product.expiration_date ? (
                                                    <span
                                                        className={
                                                            product.is_expired
                                                                ? 'font-semibold text-destructive'
                                                                : product.is_expiring_soon
                                                                  ? 'text-yellow-600'
                                                                  : ''
                                                        }
                                                    >
                                                        {new Date(
                                                            product.expiration_date,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        N/A
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {product.is_low_stock && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                                            Low Stock
                                                        </Badge>
                                                    )}
                                                    {product.is_expired && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            Expired
                                                        </Badge>
                                                    )}
                                                    {product.is_expiring_soon &&
                                                        !product.is_expired && (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-yellow-600 text-xs text-yellow-600"
                                                            >
                                                                Expiring Soon
                                                            </Badge>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/inventory/products/${product.id}`}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {can.update && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/inventory/products/${product.id}/edit`}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can.delete && (
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {products.from} to {products.to} of{' '}
                            {products.total} products
                        </p>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: products.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === products.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        router.get('/inventory/products', {
                                            page,
                                        })
                                    }
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
