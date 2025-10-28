<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RegistrationsSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    protected $registrations;

    public function __construct($registrations)
    {
        $this->registrations = $registrations;
    }

    public function array(): array
    {
        return collect($this->registrations)->map(function ($reg) {
            return [
                $reg['trans_no'],
                $reg['date'],
                $reg['member_email'],
                $reg['pin'],
                $reg['payment_method'],
                $reg['sponsor_name'] ?? 'N/A',
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return [
            'Trans No',
            'Date',
            'Member Email',
            'PIN',
            'Payment Method',
            'Sponsor',
        ];
    }

    public function title(): string
    {
        return 'Registrations';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
