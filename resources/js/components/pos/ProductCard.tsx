import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { ImageIcon, Plus } from 'lucide-react';
import React from 'react';

export type Product = {
    id: number;
    sku: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    category?: string | null;
};

export const currency = (amount: number) => `₱ ${amount.toFixed(2)}`;

type Props = {
    product: Product;
    onAdd: (product: Product) => void;
};

const ProductCard: React.FC<Props> = ({ product, onAdd }) => {
    return (
        <Card className="group gap-0 rounded-2xl py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-slate-100">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400 transition-all duration-300 group-hover:scale-110">
                            <ImageIcon className="size-10" />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-1 p-3 sm:p-4">
                <div className="line-clamp-2 text-sm font-medium text-slate-800 transition-colors duration-200 group-hover:text-primary sm:text-base">
                    {product.name}
                </div>
                <div className="text-xs text-slate-500 sm:text-sm">
                    {product.sku}
                </div>
                <div className="pt-1 text-base font-semibold text-emerald-600 transition-all duration-200 group-hover:scale-105 sm:text-lg">
                    {currency(product.price)}
                </div>
            </CardContent>
            <CardFooter className="p-3 pt-0 sm:p-4">
                <Button
                    className="w-full cursor-pointer gap-1 text-xs transition-all duration-200 hover:scale-105 active:scale-95 sm:gap-2 sm:text-sm"
                    size="sm"
                    onClick={() => onAdd(product)}
                >
                    <Plus className="size-3 transition-transform duration-200 group-hover:rotate-90 sm:size-4" />{' '}
                    <span className="xs:inline hidden">Add to Cart</span>
                    <span className="xs:hidden inline">Add</span>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductCard;
