import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import React from 'react';

interface Order {
    id: number;
    trans_no: string;
    member_name: string;
    buyer_mid: string;
    buyer_email?: string;
    buyer_phone?: string;
    total_amount: number;
    payment_method: string;
    date: string;
    paid_at?: string;
    released_at?: string;
    received_by?: string;
    status: string;
    source: string;
    items: Array<{
        product_name: string;
        product_sku: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
    }>;
}

interface PrintReceiptProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PrintReceipt: React.FC<PrintReceiptProps> = ({
    order,
    open,
    onOpenChange,
}) => {
    const printRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!printRef.current) return;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the receipt');
            return;
        }

        // Add print-optimized CSS
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${order?.trans_no}</title>
                <style>
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 5mm;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        max-width: 80mm;
                        margin: 0 auto;
                        padding: 10px;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    .text-lg { font-size: 16px; }
                    .text-sm { font-size: 11px; }
                    .text-xs { font-size: 10px; }
                    .border-dashed { border-top: 1px dashed #000; margin: 10px 0; padding-top: 10px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 4px 2px; }
                    th { border-bottom: 1px solid #000; }
                    .total-row { border-top: 1px solid #000; }
                </style>
            </head>
            <body>
                ${printRef.current.innerHTML}
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    if (!order) return null;

    const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = order.total_amount;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Order Receipt</DialogTitle>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto">
                    <div ref={printRef} className="space-y-4 p-6">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-lg font-bold">
                                YOUR COMPANY NAME
                            </h1>
                            <p className="text-sm text-gray-600">
                                123 Business Street, City, Country
                            </p>
                            <p className="text-sm text-gray-600">
                                Tel: (123) 456-7890
                            </p>
                        </div>

                        <div className="border-dashed">
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-bold">
                                        Receipt No:
                                    </span>
                                    <span>{order.trans_no}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">
                                        Date & Time:
                                    </span>
                                    <span>{order.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Source:</span>
                                    <span>{order.source}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border-dashed">
                            <p className="mb-2 text-sm font-bold">
                                Customer Information
                            </p>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="font-bold">Name:</span>{' '}
                                    {order.member_name}
                                </p>
                                <p>
                                    <span className="font-bold">MID:</span>{' '}
                                    {order.buyer_mid}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="border-dashed">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="py-2 text-left">Item</th>
                                        <th className="py-2 text-right">Qty</th>
                                        <th className="py-2 text-right">
                                            Price
                                        </th>
                                        <th className="py-2 text-right">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="py-2">
                                                <div>{item.product_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.product_sku}
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="text-right">
                                                ₱
                                                {item.unit_price.toLocaleString()}
                                            </td>
                                            <td className="text-right">
                                                ₱
                                                {item.subtotal.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="border-dashed">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₱{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (8%):</span>
                                    <span>₱{tax.toFixed(2)}</span>
                                </div>
                                <div className="total-row flex justify-between pt-2 text-base font-bold">
                                    <span>TOTAL:</span>
                                    <span>₱{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="border-dashed">
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-bold">
                                        Payment Method:
                                    </span>
                                    <span>{order.payment_method}</span>
                                </div>
                                {order.paid_at && (
                                    <div className="flex justify-between">
                                        <span className="font-bold">
                                            Paid At:
                                        </span>
                                        <span>{order.paid_at}</span>
                                    </div>
                                )}
                                {order.released_at && (
                                    <div className="flex justify-between">
                                        <span className="font-bold">
                                            Released At:
                                        </span>
                                        <span>{order.released_at}</span>
                                    </div>
                                )}
                                {order.received_by && (
                                    <div className="flex justify-between">
                                        <span className="font-bold">
                                            Received By:
                                        </span>
                                        <span>{order.received_by}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-dashed text-center text-xs text-gray-600">
                            <p className="font-bold">
                                Thank you for your business!
                            </p>
                            <p className="mt-1">
                                This serves as your official receipt.
                            </p>
                            <p className="mt-2 text-xs">
                                Powered by Your MLM System
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button onClick={handlePrint} className="flex-1">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
