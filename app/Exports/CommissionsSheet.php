<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CommissionsSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    protected $commissions;

    public function __construct($commissions)
    {
        $this->commissions = $commissions;
    }

    public function array(): array
    {
        return collect($this->commissions)->map(function ($comm) {
            return [
                $comm['date'],
                $comm['member_account'],
                $comm['member_name'],
                $comm['member_mid'],
                $comm['source'],
                '₱ '.number_format($comm['amount'], 2),
                $comm['level'] ?? '',
                $comm['percent'] ? $comm['percent'].'%' : '',
                $comm['purchase_trans_no'],
                $comm['description'] ?? '',
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Member Account',
            'Member Name',
            'Member MID',
            'Source',
            'Amount',
            'Level',
            'Percent',
            'Purchase Trans No',
            'Description',
        ];
    }

    public function title(): string
    {
        return 'Commissions';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
