import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PageProps } from '@/types';
import type { Encashment } from '@/types/encashment';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    HandCoins,
    Printer,
    X,
} from 'lucide-react';
import React from 'react';

interface ShowPageProps extends PageProps {
    encashment: Encashment;
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-blue-100 text-blue-800 border-blue-300',
    processed: 'bg-purple-100 text-purple-800 border-purple-300',
    released: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
};

const getBreadcrumbs = (
    userType: string | null | undefined,
    encashmentNo: string,
): BreadcrumbItem[] => {
    const basePath =
        userType === 'member'
            ? '/encashments'
            : userType === 'admin' || userType === 'super_admin'
              ? '/admin/encashments'
              : userType === 'accounting'
                ? '/accounting/encashments'
                : '/cashier/encashments';

    return [
        {
            title: 'Encashments',
            href: basePath,
        },
        {
            title: encashmentNo,
            href: '#',
        },
    ];
};

const EncashmentShow: React.FC<ShowPageProps> = ({ encashment }) => {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isMember = user?.utype === 'member';

    const breadcrumbs = getBreadcrumbs(user?.utype, encashment.encashment_no);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleBack = () => {
        const baseRoute = isMember
            ? '/encashments'
            : user?.utype === 'admin' || user?.utype === 'super_admin'
              ? '/admin/encashments'
              : user?.utype === 'accounting'
                ? '/accounting/encashments'
                : '/cashier/encashments';

        router.get(baseRoute);
    };

    const handlePrintVoucher = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const voucherHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Voucher - ${encashment.voucher_no || encashment.encashment_no}</title>
                <style>
                    @media print {
                        @page { margin: 1in; }
                        body { margin: 0; }
                    }
                    body {
                        font-family: 'Arial', sans-serif;
                        padding: 40px;
                        color: #333;
                    }
                    .voucher-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 2px solid #000;
                        padding: 30px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0 0 10px 0;
                        font-size: 28px;
                        text-transform: uppercase;
                    }
                    .header p {
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    .voucher-type {
                        background: #000;
                        color: #fff;
                        padding: 10px;
                        text-align: center;
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .info-section {
                        margin: 20px 0;
                    }
                    .info-row {
                        display: flex;
                        margin: 10px 0;
                        font-size: 14px;
                    }
                    .info-label {
                        font-weight: bold;
                        width: 180px;
                    }
                    .info-value {
                        flex: 1;
                    }
                    .amount-section {
                        background: #f5f5f5;
                        padding: 20px;
                        margin: 30px 0;
                        border: 2px solid #000;
                        text-align: center;
                    }
                    .amount-label {
                        font-size: 14px;
                        margin-bottom: 10px;
                    }
                    .amount-value {
                        font-size: 36px;
                        font-weight: bold;
                        color: #000;
                    }
                    .signatures {
                        margin-top: 50px;
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 30px;
                    }
                    .signature-box {
                        text-align: center;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        margin-top: 60px;
                        padding-top: 10px;
                        font-size: 12px;
                    }
                    .notes-section {
                        margin-top: 30px;
                        padding: 15px;
                        background: #f9f9f9;
                        border: 1px solid #ddd;
                    }
                    .notes-title {
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .notes-content {
                        font-size: 13px;
                        white-space: pre-wrap;
                    }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 11px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="voucher-container">
                    <div class="header">
                        <h1>Payment Voucher</h1>
                        <p>Company Name Here</p>
                        <p>Address Line 1, Address Line 2</p>
                        <p>Contact: (123) 456-7890 | Email: info@company.com</p>
                    </div>

                    <div class="voucher-type">
                        ${encashment.payment_type?.toUpperCase() || 'VOUCHER'}
                    </div>

                    <div class="info-section">
                        <div class="info-row">
                            <span class="info-label">Voucher No:</span>
                            <span class="info-value">${encashment.voucher_no || encashment.encashment_no}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Encashment No:</span>
                            <span class="info-value">${encashment.encashment_no}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date Issued:</span>
                            <span class="info-value">${formatDate(encashment.processed_at || encashment.created_at)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value">${encashment.status.toUpperCase()}</span>
                        </div>
                    </div>

                    <Separator />

                    <div class="info-section">
                        <h3 style="margin-bottom: 15px;">Payee Information</h3>
                        <div class="info-row">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${encashment.member.name}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Member ID:</span>
                            <span class="info-value">${encashment.member.MID}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${encashment.member.email}</span>
                        </div>
                        ${
                            encashment.member.address
                                ? `
                        <div class="info-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${encashment.member.address}</span>
                        </div>
                        `
                                : ''
                        }
                        ${
                            encashment.member.mobile
                                ? `
                        <div class="info-row">
                            <span class="info-label">Mobile:</span>
                            <span class="info-value">${encashment.member.mobile}</span>
                        </div>
                        `
                                : ''
                        }
                    </div>

                    <div class="amount-section">
                        <div class="amount-label">AMOUNT TO BE PAID</div>
                        <div class="amount-value">${formatCurrency(encashment.amount)}</div>
                    </div>

                    ${
                        encashment.accounting_notes
                            ? `
                    <div class="notes-section">
                        <div class="notes-title">Accounting Notes:</div>
                        <div class="notes-content">${encashment.accounting_notes}</div>
                    </div>
                    `
                            : ''
                    }

                    <div class="signatures">
                        <div class="signature-box">
                            <div class="signature-line">
                                Prepared By<br>
                                ${encashment.processed_by?.name || '_______________'}
                            </div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line">
                                Approved By<br>
                                ${encashment.approved_by?.name || '_______________'}
                            </div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line">
                                Received By<br>
                                ${encashment.received_by_name || encashment.received_by?.name || '_______________'}
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>This is a computer-generated document and does not require a signature.</p>
                        <p>Printed on: ${new Date().toLocaleString()}</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(voucherHTML);
        printWindow.document.close();
    };

    const handlePrintCEOApproval = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const approvalHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>CEO Approval Form - ${encashment.encashment_no}</title>
                <style>
                    @media print {
                        @page { margin: 1in; }
                        body { margin: 0; }
                    }
                    body {
                        font-family: 'Arial', sans-serif;
                        padding: 40px;
                        color: #333;
                        line-height: 1.6;
                    }
                    .form-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 2px solid #000;
                        padding: 40px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #000;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0 0 10px 0;
                        font-size: 24px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .header h2 {
                        margin: 0;
                        font-size: 18px;
                        color: #666;
                        font-weight: normal;
                    }
                    .info-section {
                        margin: 25px 0;
                    }
                    .info-row {
                        margin: 12px 0;
                        font-size: 14px;
                        display: flex;
                    }
                    .info-label {
                        font-weight: bold;
                        width: 200px;
                    }
                    .info-value {
                        flex: 1;
                        border-bottom: 1px dotted #999;
                    }
                    .approval-box {
                        margin: 40px 0;
                        padding: 30px;
                        border: 2px solid #000;
                        background: #f9f9f9;
                    }
                    .approval-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .approval-options {
                        display: flex;
                        justify-content: center;
                        gap: 50px;
                        margin: 30px 0;
                    }
                    .approval-option {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 16px;
                    }
                    .checkbox {
                        width: 20px;
                        height: 20px;
                        border: 2px solid #000;
                        display: inline-block;
                    }
                    .signature-section {
                        margin-top: 60px;
                    }
                    .signature-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 50px;
                        margin-top: 30px;
                    }
                    .signature-box {
                        text-align: center;
                    }
                    .signature-line {
                        border-top: 2px solid #000;
                        margin-top: 80px;
                        padding-top: 10px;
                    }
                    .signature-label {
                        font-weight: bold;
                        font-size: 14px;
                    }
                    .signature-sublabel {
                        font-size: 12px;
                        color: #666;
                        margin-top: 5px;
                    }
                    .notes-area {
                        margin: 30px 0;
                    }
                    .notes-title {
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .notes-box {
                        border: 1px solid #000;
                        min-height: 100px;
                        padding: 15px;
                        background: #fff;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                        border-top: 1px solid #ccc;
                        padding-top: 15px;
                    }
                    .important-notice {
                        background: #fff3cd;
                        border: 2px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        font-size: 13px;
                    }
                </style>
            </head>
            <body>
                <div class="form-container">
                    <div class="header">
                        <h1>CEO Approval Form</h1>
                        <h2>Encashment Request Authorization</h2>
                    </div>

                    <div class="important-notice">
                        <strong>Important:</strong> This document requires CEO signature for final approval and authorization of payment.
                    </div>

                    <div class="info-section">
                        <h3 style="margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px;">Request Details</h3>
                        <div class="info-row">
                            <span class="info-label">Encashment No:</span>
                            <span class="info-value">${encashment.encashment_no}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Voucher No:</span>
                            <span class="info-value">${encashment.voucher_no || 'To be generated'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Request Date:</span>
                            <span class="info-value">${formatDate(encashment.created_at)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Amount:</span>
                            <span class="info-value" style="font-size: 18px; font-weight: bold;">${formatCurrency(encashment.amount)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Type:</span>
                            <span class="info-value">${encashment.payment_type?.toUpperCase() || 'VOUCHER'}</span>
                        </div>
                    </div>

                    <div class="info-section">
                        <h3 style="margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px;">Member Information</h3>
                        <div class="info-row">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${encashment.member.name}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Member ID:</span>
                            <span class="info-value">${encashment.member.MID}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${encashment.member.email}</span>
                        </div>
                    </div>

                    <div class="info-section">
                        <h3 style="margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px;">Approval Trail</h3>
                        <div class="info-row">
                            <span class="info-label">Approved By (Admin):</span>
                            <span class="info-value">${encashment.approved_by?.name || 'Pending'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Approval Date:</span>
                            <span class="info-value">${formatDate(encashment.approved_at)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Processed By (Accounting):</span>
                            <span class="info-value">${encashment.processed_by?.name || 'Pending'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Processing Date:</span>
                            <span class="info-value">${formatDate(encashment.processed_at)}</span>
                        </div>
                    </div>

                    <div class="approval-box">
                        <div class="approval-title">CEO DECISION</div>
                        <div class="approval-options">
                            <div class="approval-option">
                                <span class="checkbox"></span>
                                <span>APPROVED</span>
                            </div>
                            <div class="approval-option">
                                <span class="checkbox"></span>
                                <span>DENIED</span>
                            </div>
                        </div>
                    </div>

                    <div class="notes-area">
                        <div class="notes-title">CEO Notes / Comments:</div>
                        <div class="notes-box"></div>
                    </div>

                    <div class="signature-section">
                        <div class="signature-row">
                            <div class="signature-box">
                                <div class="signature-line">
                                    <div class="signature-label">CEO Signature</div>
                                    <div class="signature-sublabel">Chief Executive Officer</div>
                                </div>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line">
                                    <div class="signature-label">Date</div>
                                    <div class="signature-sublabel">MM / DD / YYYY</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p><strong>For Official Use Only</strong></p>
                        <p>Document Reference: ${encashment.encashment_no} | Generated: ${new Date().toLocaleString()}</p>
                        <p>This document is confidential and intended solely for authorized personnel.</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(approvalHTML);
        printWindow.document.close();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Encashment ${encashment.encashment_no}`} />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Encashment Details
                            </h1>
                            <p className="text-muted-foreground">
                                {encashment.encashment_no}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(encashment.status === 'processed' ||
                            encashment.status === 'released') && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handlePrintVoucher}
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Voucher
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handlePrintCEOApproval}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    CEO Approval Form
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status and Amount Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Request Summary</CardTitle>
                                <CardDescription>
                                    Submitted on{' '}
                                    {formatDate(encashment.created_at)}
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className={statusColors[encashment.status]}
                            >
                                {encashment.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Encashment Amount
                                </div>
                                <div className="text-3xl font-bold">
                                    {formatCurrency(encashment.amount)}
                                </div>
                            </div>
                            {encashment.voucher_no && (
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Voucher Number
                                    </div>
                                    <div className="font-mono text-xl font-semibold">
                                        {encashment.voucher_no}
                                    </div>
                                </div>
                            )}
                            {encashment.payment_type && (
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Payment Type
                                    </div>
                                    <div className="text-xl font-semibold capitalize">
                                        {encashment.payment_type.replace(
                                            '_',
                                            ' ',
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Member Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Member Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Name
                                </div>
                                <div className="font-medium">
                                    {encashment.member.name}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Member ID
                                </div>
                                <div className="font-medium">
                                    {encashment.member.MID}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Email
                                </div>
                                <div className="font-medium">
                                    {encashment.member.email}
                                </div>
                            </div>
                            {encashment.member.mobile && (
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Mobile
                                    </div>
                                    <div className="font-medium">
                                        {encashment.member.mobile}
                                    </div>
                                </div>
                            )}
                        </div>
                        {encashment.member.address && (
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Address
                                </div>
                                <div className="font-medium">
                                    {encashment.member.address}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Timeline/Approval Trail */}
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Trail</CardTitle>
                        <CardDescription>
                            Track the processing history of this encashment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Created */}
                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">
                                        Request Created
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDate(encashment.created_at)}
                                    </div>
                                    {encashment.member_notes && (
                                        <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                                            <strong>Member Notes:</strong>{' '}
                                            {encashment.member_notes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Approved */}
                            {encashment.approved_at && (
                                <>
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                Approved by Admin
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {encashment.approved_by?.name}{' '}
                                                on{' '}
                                                {formatDate(
                                                    encashment.approved_at,
                                                )}
                                            </div>
                                            {encashment.admin_notes && (
                                                <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                                                    <strong>
                                                        Admin Notes:
                                                    </strong>{' '}
                                                    {encashment.admin_notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Processed */}
                            {encashment.processed_at && (
                                <>
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                Processed by Accounting
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {encashment.processed_by?.name}{' '}
                                                on{' '}
                                                {formatDate(
                                                    encashment.processed_at,
                                                )}
                                            </div>
                                            {encashment.accounting_notes && (
                                                <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                                                    <strong>
                                                        Accounting Notes:
                                                    </strong>{' '}
                                                    {
                                                        encashment.accounting_notes
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Released */}
                            {encashment.released_at && (
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                        <HandCoins className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            Released by Cashier
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {encashment.released_by?.name} on{' '}
                                            {formatDate(encashment.released_at)}
                                        </div>
                                        <div className="mt-1 text-sm">
                                            Received by:{' '}
                                            <strong>
                                                {encashment.received_by_name ||
                                                    encashment.received_by
                                                        ?.name ||
                                                    'Not specified'}
                                            </strong>
                                        </div>
                                        {encashment.cashier_notes && (
                                            <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                                                <strong>Cashier Notes:</strong>{' '}
                                                {encashment.cashier_notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rejected */}
                            {encashment.rejected_at && (
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <X className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            Rejected
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {encashment.rejected_by?.name} on{' '}
                                            {formatDate(encashment.rejected_at)}
                                        </div>
                                        {encashment.rejection_reason && (
                                            <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-900">
                                                <strong>Reason:</strong>{' '}
                                                {encashment.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default EncashmentShow;
