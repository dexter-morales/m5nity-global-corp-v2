<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class CashierReportExport implements WithMultipleSheets
{
    use Exportable;

    protected $purchases;

    protected $commissions;

    protected $registrations;

    protected $summary;

    public function __construct($purchases, $commissions, $registrations, $summary)
    {
        $this->purchases = $purchases;
        $this->commissions = $commissions;
        $this->registrations = $registrations;
        $this->summary = $summary;
    }

    public function sheets(): array
    {
        return [
            new SummarySheet($this->summary),
            new PurchasesSheet($this->purchases),
            new CommissionsSheet($this->commissions),
            new RegistrationsSheet($this->registrations),
        ];
    }
}
