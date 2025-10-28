<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SummarySheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    protected $summary;

    public function __construct($summary)
    {
        $this->summary = $summary;
    }

    public function array(): array
    {
        return [
            ['Total Purchases', $this->summary['total_purchases'] ?? 0],
            ['Total Sales', '₱ '.number_format($this->summary['total_sales'] ?? 0, 2)],
            ['Total Commissions', '₱ '.number_format($this->summary['total_commissions'] ?? 0, 2)],
            ['Total Registrations', $this->summary['total_registrations'] ?? 0],
            [''],
            ['SALES BY PAYMENT METHOD', ''],
            ['Payment Method', 'Count', 'Total Amount'],
            ...collect($this->summary['by_payment_method'] ?? [])->map(function ($data, $method) {
                return [$method, $data['count'], '₱ '.number_format($data['total'], 2)];
            })->values()->toArray(),
        ];
    }

    public function headings(): array
    {
        return ['Metric', 'Value'];
    }

    public function title(): string
    {
        return 'Summary';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
            6 => ['font' => ['bold' => true]],
            7 => ['font' => ['bold' => true]],
        ];
    }
}
