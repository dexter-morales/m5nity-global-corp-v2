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
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function CreateProduct() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        description: '',
        price: '',
        stock_quantity: '0',
        reorder_level: '10',
        expiration_date: '',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory/products');
    };

    return (
        <AppLayout>
            <Head title="Create Product" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inventory/products">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Create Product
                        </h1>
                        <p className="text-muted-foreground">
                            Add a new product to inventory
                        </p>
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
                                        placeholder="PROD-001"
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
                                    <Label htmlFor="stock_quantity">
                                        Initial Stock Quantity *
                                    </Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        min="0"
                                        value={data.stock_quantity}
                                        onChange={(e) =>
                                            setData(
                                                'stock_quantity',
                                                e.target.value,
                                            )
                                        }
                                        error={errors.stock_quantity}
                                        required
                                    />
                                    {errors.stock_quantity && (
                                        <p className="text-sm text-destructive">
                                            {errors.stock_quantity}
                                        </p>
                                    )}
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
                                    <p className="text-xs text-muted-foreground">
                                        You'll be notified when stock falls
                                        below this level
                                    </p>
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
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
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
                                        ? 'Creating...'
                                        : 'Create Product'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
