<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PurchasesSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    protected $purchases;

    public function __construct($purchases)
    {
        $this->purchases = $purchases;
    }

    public function array(): array
    {
        return collect($this->purchases)->map(function ($purchase) {
            $items = collect($purchase['items'] ?? [])->map(function ($item) {
                return $item['product_name'].' (Qty: '.$item['quantity'].')';
            })->implode('; ');

            return [
                $purchase['trans_no'],
                $purchase['date'],
                $purchase['buyer_account'],
                $purchase['buyer_name'],
                $purchase['buyer_mid'],
                '₱ '.number_format($purchase['total_amount'], 2),
                $purchase['payment_method'],
                $items,
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return [
            'Trans No',
            'Date',
            'Buyer Account',
            'Buyer Name',
            'Buyer MID',
            'Total Amount',
            'Payment Method',
            'Items',
        ];
    }

    public function title(): string
    {
        return 'Purchases';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
