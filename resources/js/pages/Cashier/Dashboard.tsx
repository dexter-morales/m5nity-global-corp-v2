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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart2,
    DollarSign,
    Download,
    FileText,
    Filter,
    Ticket,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface ReportData {
    purchases: any[];
    commissions: any[];
    summary: any;
    filters: {
        start_date: string;
        end_date: string;
        payment_method: string | null;
    };
}

export default function CashierDashboard({
    metrics,
    transactions = [],
    pinSummary = {},
    reportData,
    showReports = false,
}: any) {
    const getDefaultStartDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    };

    const getDefaultEndDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const [filters, setFilters] = useState({
        start_date: reportData?.filters?.start_date || getDefaultStartDate(),
        end_date: reportData?.filters?.end_date || getDefaultEndDate(),
        payment_method: reportData?.filters?.payment_method || 'all',
    });

    const [expandedPurchases, setExpandedPurchases] = useState<Set<number>>(
        new Set(),
    );

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        router.get(
            '/cashier/reports',
            {
                start_date: filters.start_date,
                end_date: filters.end_date,
                payment_method:
                    filters.payment_method === 'all'
                        ? undefined
                        : filters.payment_method || undefined,
            },
            { preserveState: false },
        );
    };

    const exportReport = () => {
        const params = new URLSearchParams({
            start_date: filters.start_date,
            end_date: filters.end_date,
            export: '1',
        });

        if (filters.payment_method && filters.payment_method !== 'all') {
            params.append('payment_method', filters.payment_method);
        }

        window.location.href = `/cashier/reports?${params.toString()}`;
    };

    const togglePurchaseDetails = (purchaseId: number) => {
        setExpandedPurchases((prev) => {
            const next = new Set(prev);
            if (next.has(purchaseId)) {
                next.delete(purchaseId);
            } else {
                next.add(purchaseId);
            }
            return next;
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Cashier', href: '/cashier' },
                ...(showReports
                    ? [{ title: 'Reports', href: '/cashier/reports' }]
                    : []),
            ]}
        >
            <Head
                title={showReports ? 'Cashier Reports' : 'Cashier Dashboard'}
            />
            <div className="space-y-6 p-4 sm:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">
                            {showReports
                                ? 'Cashier Reports'
                                : 'Cashier Dashboard'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {showReports
                                ? 'Generate and export detailed reports'
                                : 'Overview of your cashier activities'}
                        </p>
                    </div>
                </header>
            </div>

            <Tabs
                defaultValue={showReports ? 'reports' : 'overview'}
                className="w-full"
            >
                <TabsList className="ml-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 p-6 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm text-muted-foreground">
                                    Registrations Today
                                </CardTitle>
                                <div className="rounded-md bg-primary/10 p-2 text-primary">
                                    <Users className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="text-2xl font-semibold">
                                {metrics?.registrations_today ?? 0}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm text-muted-foreground">
                                    Unused Pins
                                </CardTitle>
                                <div className="rounded-md bg-primary/10 p-2 text-primary">
                                    <Ticket className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="text-2xl font-semibold">
                                {metrics?.unused_pins ?? 0}
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm text-muted-foreground">
                                    Collected Today
                                </CardTitle>
                                <div className="rounded-md bg-primary/10 p-2 text-primary">
                                    <DollarSign className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid grid-cols-2 gap-2 text-sm">
                                    {(metrics?.collected_today ?? []).map(
                                        (r: any, i: number) => (
                                            <li
                                                key={i}
                                                className="flex justify-between"
                                            >
                                                <span className="text-slate-600">
                                                    {r.payment_method ?? '-'}
                                                </span>
                                                <span className="font-medium">
                                                    {r.total}
                                                </span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3">
                                                    Transaction #
                                                </th>
                                                <th className="px-4 py-3">
                                                    Method
                                                </th>
                                                <th className="px-4 py-3">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3">
                                                    Pin
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {transactions.length ? (
                                                transactions.map((t: any) => (
                                                    <tr
                                                        key={t.id}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <td className="px-4 py-3 text-slate-600">
                                                            {t.created_at
                                                                ? new Date(
                                                                      t.created_at,
                                                                  ).toLocaleString()
                                                                : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-slate-800">
                                                            {t.trans_no}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">
                                                            {t.payment_method ??
                                                                '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">
                                                            {t.member_email}
                                                        </td>
                                                        <td className="px-4 py-3 font-mono">
                                                            {t.pin ?? '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-6 text-center text-slate-400"
                                                    >
                                                        No transactions
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Pin Inventory</CardTitle>
                                <div className="rounded-md bg-primary/10 p-2 text-primary">
                                    <BarChart2 className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {Object.entries(
                                        pinSummary as Record<string, number>,
                                    ).map(([status, total]) => (
                                        <li
                                            key={status}
                                            className="flex justify-between"
                                        >
                                            <span className="text-slate-600 capitalize">
                                                {status}
                                            </span>
                                            <span className="font-medium">
                                                {total}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                    {reportData ? (
                        <>
                            {/* Filters Section */}
                            <Card className="mx-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Filter className="size-5" />
                                        Report Filters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">
                                                Start Date
                                            </Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={filters.start_date}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'start_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">
                                                End Date
                                            </Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={filters.end_date}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'end_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_method">
                                                Payment Method
                                            </Label>
                                            <Select
                                                value={filters.payment_method}
                                                onValueChange={(value) =>
                                                    handleFilterChange(
                                                        'payment_method',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Methods" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Methods
                                                    </SelectItem>
                                                    <SelectItem value="Cash">
                                                        Cash
                                                    </SelectItem>
                                                    <SelectItem value="GCash">
                                                        GCash
                                                    </SelectItem>
                                                    <SelectItem value="Bank Transfer">
                                                        Bank Transfer
                                                    </SelectItem>
                                                    <SelectItem value="Credit Card">
                                                        Credit Card
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button onClick={applyFilters}>
                                            <Filter className="mr-2 size-4" />
                                            Apply Filters
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={exportReport}
                                        >
                                            <Download className="mr-2 size-4" />
                                            Export CSV
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Cards */}
                            <div className="grid gap-4 px-6 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">
                                            Total Purchases
                                        </CardTitle>
                                        <FileText className="size-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {reportData.summary
                                                ?.total_purchases ?? 0}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">
                                            Total Sales
                                        </CardTitle>
                                        <DollarSign className="size-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ₱
                                            {(
                                                reportData.summary
                                                    ?.total_sales ?? 0
                                            ).toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">
                                            Total Commissions
                                        </CardTitle>
                                        <TrendingUp className="size-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ₱
                                            {(
                                                reportData.summary
                                                    ?.total_commissions ?? 0
                                            ).toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">
                                            Avg Per Purchase
                                        </CardTitle>
                                        <BarChart2 className="size-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ₱
                                            {reportData.summary?.total_purchases
                                                ? Math.round(
                                                      reportData.summary
                                                          .total_sales /
                                                          reportData.summary
                                                              .total_purchases,
                                                  ).toLocaleString()
                                                : 0}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Purchases Report */}
                            <Card className="mx-6">
                                <CardHeader>
                                    <CardTitle>Purchases Detail</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">
                                                        Trans #
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Buyer
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        MID
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Method
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Items
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.purchases
                                                    ?.length ? (
                                                    reportData.purchases.map(
                                                        (purchase: any) => (
                                                            <>
                                                                <tr
                                                                    key={
                                                                        purchase.id
                                                                    }
                                                                    className="cursor-pointer hover:bg-slate-50"
                                                                    onClick={() =>
                                                                        togglePurchaseDetails(
                                                                            purchase.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <td className="px-4 py-3 font-mono text-xs">
                                                                        {
                                                                            purchase.trans_no
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-600">
                                                                        {
                                                                            purchase.date
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {
                                                                                    purchase.buyer_name
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-slate-500">
                                                                                {
                                                                                    purchase.buyer_account
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-600">
                                                                        {
                                                                            purchase.buyer_mid
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-3 font-semibold">
                                                                        ₱
                                                                        {purchase.total_amount.toLocaleString()}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                                                            {
                                                                                purchase.payment_method
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-600">
                                                                        {
                                                                            purchase
                                                                                .items
                                                                                ?.length
                                                                        }{' '}
                                                                        item(s)
                                                                    </td>
                                                                </tr>
                                                                {expandedPurchases.has(
                                                                    purchase.id,
                                                                ) && (
                                                                    <tr>
                                                                        <td
                                                                            colSpan={
                                                                                7
                                                                            }
                                                                            className="bg-slate-50 px-4 py-4"
                                                                        >
                                                                            <div className="space-y-2">
                                                                                <h4 className="text-sm font-semibold">
                                                                                    Purchase
                                                                                    Items:
                                                                                </h4>
                                                                                <table className="w-full text-xs">
                                                                                    <thead className="bg-slate-100">
                                                                                        <tr>
                                                                                            <th className="px-3 py-2 text-left">
                                                                                                SKU
                                                                                            </th>
                                                                                            <th className="px-3 py-2 text-left">
                                                                                                Product
                                                                                            </th>
                                                                                            <th className="px-3 py-2 text-right">
                                                                                                Qty
                                                                                            </th>
                                                                                            <th className="px-3 py-2 text-right">
                                                                                                Unit
                                                                                                Price
                                                                                            </th>
                                                                                            <th className="px-3 py-2 text-right">
                                                                                                Subtotal
                                                                                            </th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-slate-200">
                                                                                        {purchase.items?.map(
                                                                                            (
                                                                                                item: any,
                                                                                                idx: number,
                                                                                            ) => (
                                                                                                <tr
                                                                                                    key={
                                                                                                        idx
                                                                                                    }
                                                                                                >
                                                                                                    <td className="px-3 py-2">
                                                                                                        {
                                                                                                            item.product_sku
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="px-3 py-2">
                                                                                                        {
                                                                                                            item.product_name
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="px-3 py-2 text-right">
                                                                                                        {
                                                                                                            item.quantity
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="px-3 py-2 text-right">
                                                                                                        ₱
                                                                                                        {item.unit_price.toLocaleString()}
                                                                                                    </td>
                                                                                                    <td className="px-3 py-2 text-right font-semibold">
                                                                                                        ₱
                                                                                                        {item.subtotal.toLocaleString()}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ),
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={7}
                                                            className="px-4 py-6 text-center text-slate-400"
                                                        >
                                                            No purchases found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Commissions Report */}
                            <Card className="mx-6">
                                <CardHeader>
                                    <CardTitle>Commissions Detail</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Member
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        MID
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Source
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Level
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        %
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Purchase
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.commissions
                                                    ?.length ? (
                                                    reportData.commissions.map(
                                                        (comm: any) => (
                                                            <tr
                                                                key={comm.id}
                                                                className="hover:bg-slate-50"
                                                            >
                                                                <td className="px-4 py-3 text-slate-600">
                                                                    {comm.date}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {
                                                                                comm.member_name
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-slate-500">
                                                                            {
                                                                                comm.member_account
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-600">
                                                                    {
                                                                        comm.member_mid
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 capitalize">
                                                                        {
                                                                            comm.source
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {comm.level ??
                                                                        '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {comm.percent
                                                                        ? `${comm.percent}%`
                                                                        : '-'}
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold">
                                                                    ₱
                                                                    {comm.amount.toLocaleString()}
                                                                </td>
                                                                <td className="px-4 py-3 font-mono text-xs">
                                                                    {
                                                                        comm.purchase_trans_no
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={8}
                                                            className="px-4 py-6 text-center text-slate-400"
                                                        >
                                                            No commissions found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Statistics */}
                            <div className="grid gap-6 px-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Sales by Payment Method
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {Object.entries(
                                                reportData.summary
                                                    ?.by_payment_method || {},
                                            ).length > 0 ? (
                                                Object.entries(
                                                    reportData.summary
                                                        ?.by_payment_method ||
                                                        {},
                                                ).map(([method, data]: any) => (
                                                    <div
                                                        key={method}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {method}
                                                        </span>
                                                        <div className="text-right">
                                                            <div className="font-semibold">
                                                                ₱
                                                                {data.total.toLocaleString()}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {data.count}{' '}
                                                                transaction(s)
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-500">
                                                    No data available
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Commissions by Source
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {Object.entries(
                                                reportData.summary?.by_source ||
                                                    {},
                                            ).length > 0 ? (
                                                Object.entries(
                                                    reportData.summary
                                                        ?.by_source || {},
                                                ).map(([source, data]: any) => (
                                                    <div
                                                        key={source}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className="text-sm font-medium capitalize">
                                                            {source}
                                                        </span>
                                                        <div className="text-right">
                                                            <div className="font-semibold">
                                                                ₱
                                                                {data.total.toLocaleString()}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {data.count}{' '}
                                                                commission(s)
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-500">
                                                    No data available
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>
                                            Top 10 Buyers by Total Spent
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3">
                                                            Rank
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Buyer Name
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            MID
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Purchases
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Total Spent
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {reportData.summary?.top_buyers?.map(
                                                        (
                                                            buyer: any,
                                                            idx: number,
                                                        ) => (
                                                            <tr
                                                                key={idx}
                                                                className="hover:bg-slate-50"
                                                            >
                                                                <td className="px-4 py-3 font-semibold">
                                                                    #{idx + 1}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {
                                                                        buyer.buyer_name
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-600">
                                                                    {
                                                                        buyer.buyer_mid
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {
                                                                        buyer.purchase_count
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold">
                                                                    ₱
                                                                    {buyer.total_spent.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <Card className="mx-6">
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <FileText className="mx-auto size-12 text-slate-400" />
                                    <h3 className="mt-4 text-lg font-semibold">
                                        No Report Data
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Click the button below to generate a
                                        report
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={applyFilters}
                                    >
                                        Generate Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
