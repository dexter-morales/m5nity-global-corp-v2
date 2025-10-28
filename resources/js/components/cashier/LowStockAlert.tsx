import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface LowStockProduct {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
}

interface LowStockAlertProps {
    lowStockProducts: LowStockProduct[];
    outOfStockCount: number;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
    lowStockProducts,
    outOfStockCount,
}) => {
    if (lowStockProducts.length === 0 && outOfStockCount === 0) return null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Alert className="cursor-pointer border-amber-200 bg-amber-50 transition-all hover:bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">
                        Inventory Warnings
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                        {lowStockProducts.length > 0 && (
                            <span>
                                {lowStockProducts.length} product(s) running low
                                on stock.
                            </span>
                        )}
                        {outOfStockCount > 0 && (
                            <span className="ml-2">
                                {outOfStockCount} product(s) out of stock.
                            </span>
                        )}
                        <span className="ml-2 font-semibold">
                            Click to view details
                        </span>
                    </AlertDescription>
                </Alert>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Inventory Warnings
                    </SheetTitle>
                    <SheetDescription>
                        Products that need restocking
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {outOfStockCount > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm font-semibold text-red-900">
                                ⚠️ {outOfStockCount} product(s) are completely
                                out of stock
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700">
                            Low Stock Products
                        </h3>
                        {lowStockProducts.map((product) => (
                            <div
                                key={product.id}
                                className="rounded-lg border border-slate-200 bg-white p-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            SKU: {product.sku}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-600">
                                            {product.stock_quantity} left
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Threshold:{' '}
                                            {product.low_stock_threshold}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
