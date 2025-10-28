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
import { Package, PaginatedData } from '@/types/inventory';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Eye,
    MoreVertical,
    PackageIcon,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    packages: PaginatedData<Package>;
    filters: {
        search?: string;
        status?: string;
    };
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

export default function PackagesIndex({ packages, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/inventory/packages',
            {
                search,
                status: status !== 'all' ? status : undefined,
            },
            { preserveState: true },
        );
    };

    const handleDelete = (pkg: Package) => {
        if (confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
            router.delete(`/inventory/packages/${pkg.id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary'> = {
            active: 'default',
            inactive: 'secondary',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Packages" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">
                            Packages
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage product packages
                        </p>
                    </div>
                    {can.create && (
                        <Button asChild>
                            <Link href="/inventory/packages/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Package
                            </Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Packages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Search by name or code..."
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
                                    <TableHead>Code</TableHead>
                                    <TableHead>Package Name</TableHead>
                                    <TableHead>Products Count</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-8 text-center"
                                        >
                                            <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-2 text-muted-foreground">
                                                No packages found
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    packages.data.map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-mono text-sm">
                                                {pkg.code}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {pkg.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {pkg.total_products_count}{' '}
                                                    products
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                ₱
                                                {parseFloat(
                                                    pkg.price.toString(),
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(pkg.status)}
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
                                                                href={`/inventory/packages/${pkg.id}`}
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
                                                                    href={`/inventory/packages/${pkg.id}/edit`}
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
                                                                        pkg,
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
                {packages.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {packages.from} to {packages.to} of{' '}
                            {packages.total} packages
                        </p>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: packages.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === packages.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        router.get('/inventory/packages', {
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
