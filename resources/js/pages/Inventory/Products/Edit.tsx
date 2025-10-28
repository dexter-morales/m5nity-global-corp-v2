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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Product } from '@/types/inventory';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    product: Product;
}

export default function EditProduct({ product }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        price: product.price.toString(),
        reorder_level: product.reorder_level.toString(),
        expiration_date: product.expiration_date || '',
        status: product.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/inventory/products/${product.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${product.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inventory/products">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Product
                        </h1>
                        <p className="text-muted-foreground">{product.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        error={errors.name}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU *</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) =>
                                            setData('sku', e.target.value)
                                        }
                                        error={errors.sku}
                                        required
                                    />
                                    {errors.sku && (
                                        <p className="text-sm text-destructive">
                                            {errors.sku}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₱) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData('price', e.target.value)
                                        }
                                        error={errors.price}
                                        required
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Current Stock Quantity</Label>
                                    <div className="rounded-md bg-muted p-2 text-lg font-semibold">
                                        {product.stock_quantity} units
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Use the "Adjust Stock" button to change
                                        stock levels
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reorder_level">
                                        Reorder Level *
                                    </Label>
                                    <Input
                                        id="reorder_level"
                                        type="number"
                                        min="0"
                                        value={data.reorder_level}
                                        onChange={(e) =>
                                            setData(
                                                'reorder_level',
                                                e.target.value,
                                            )
                                        }
                                        error={errors.reorder_level}
                                        required
                                    />
                                    {errors.reorder_level && (
                                        <p className="text-sm text-destructive">
                                            {errors.reorder_level}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiration_date">
                                        Expiration Date
                                    </Label>
                                    <Input
                                        id="expiration_date"
                                        type="date"
                                        value={data.expiration_date}
                                        onChange={(e) =>
                                            setData(
                                                'expiration_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.expiration_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.expiration_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    {errors.status && (
                                        <p className="text-sm text-destructive">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/inventory/products">
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Updating...'
                                        : 'Update Product'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
