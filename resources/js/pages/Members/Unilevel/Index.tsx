import { useServerTableControls } from '@/components/data-table/use-server-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import membersRoutes from '@/routes/members';
import type { BreadcrumbItem, Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

type IncomeRecord = {
    id: number;
    amount: number;
    source: string;
    description?: string | null;
    created_at?: string | null;
    level?: number | null;
    percentage?: number | null;
    purchase_id?: number | null;
};

type PurchaseBreakdown = {
    level: number;
    total_purchases: number;
    percentage: number;
    commission_value: number;
    downline_count: number;
};

type Summary = {
    total_income: number;
    total_purchases: number;
    active_downlines: number;
};

interface Props {
    incomes: Paginated<IncomeRecord>;
    purchases: PurchaseBreakdown[];
    summary: Summary;
    message?: string | null;
    filters?: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unilevel',
        href: membersRoutes.unilevel.url(),
    },
];

const UnilevelIndex: React.FC<Props> = ({
    incomes,
    purchases = [],
    summary,
    message,
    filters = {},
}) => {
    const { searchTerm, setSearchTerm, toggleSort, sortIndicator } =
        useServerTableControls({
            route: membersRoutes.unilevel.url(),
            filters,
            defaultSort: 'date',
            defaultDirection: 'desc',
        });

    const formatDate = (value?: string | null) =>
        value ? new Date(value).toLocaleString() : '-';

    const formatAmount = (amount: number) => `PHP ${amount.toLocaleString()}`;

    const formatPercentage = (percentage: number) => `${percentage}%`;

    const rows = incomes?.data ?? [];
    const meta = incomes?.meta;
    const links = incomes?.links ?? [];

    const from = meta?.from ?? 0;
    const to = meta?.to ?? 0;
    const total = meta?.total ?? 0;
    const enDash = String.fromCharCode(0x2013);

    const formatPagerLabel = (label: string) =>
        label
            .replace('&laquo;', String.fromCharCode(0x00ab))
            .replace('&raquo;', String.fromCharCode(0x00bb));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unilevel Income" />

            <div className="space-y-6 p-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Unilevel Income
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatAmount(summary.total_income)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Downline Purchases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatAmount(summary.total_purchases)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Downlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary.active_downlines}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Purchases Breakdown Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Purchases Breakdown by Level</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            View total purchases and commission earnings per
                            unilevel tier
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Level</th>
                                        <th className="px-4 py-3">Downlines</th>
                                        <th className="px-4 py-3">
                                            Total Purchases
                                        </th>
                                        <th className="px-4 py-3">
                                            Commission %
                                        </th>
                                        <th className="px-4 py-3">
                                            Commission Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {purchases.length > 0 ? (
                                        purchases.map((row) => (
                                            <tr
                                                key={row.level}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-3 text-slate-600">
                                                    Level {row.level}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {row.downline_count}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {formatAmount(
                                                        row.total_purchases,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {formatPercentage(
                                                        row.percentage,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-green-600">
                                                    {formatAmount(
                                                        row.commission_value,
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-8 text-center text-slate-400"
                                            >
                                                No purchases recorded from
                                                downlines yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Income History Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Unilevel Income History</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Track your unilevel commission earnings from
                                    downline purchases
                                </p>
                            </div>
                            <div className="w-full max-w-xs">
                                <Input
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search income records..."
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {message && (
                            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                                {message}
                            </div>
                        )}

                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing {from} {enDash} {to} of {total} matching
                                records
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleSort('date')}
                                    className={cn(
                                        'whitespace-nowrap',
                                        (filters.sort ?? 'date') === 'date' &&
                                            'bg-slate-100',
                                    )}
                                >
                                    <span className="flex items-center gap-1">
                                        <span>Date</span>
                                        <span className="text-xs text-slate-500">
                                            {sortIndicator('date')}
                                        </span>
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleSort('amount')}
                                    className={cn(
                                        'whitespace-nowrap',
                                        filters.sort === 'amount' &&
                                            'bg-slate-100',
                                    )}
                                >
                                    <span className="flex items-center gap-1">
                                        <span>Amount</span>
                                        <span className="text-xs text-slate-500">
                                            {sortIndicator('amount')}
                                        </span>
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Level</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">
                                            Commission %
                                        </th>
                                        <th className="px-4 py-3">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.length > 0 ? (
                                        rows.map((row, index) => (
                                            <tr
                                                key={
                                                    row.created_at
                                                        ? `${row.id}-${row.created_at}`
                                                        : `income-${row.id}-${index}`
                                                }
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-3 text-slate-600">
                                                    {formatDate(row.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {row.level ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {formatAmount(row.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {row.percentage
                                                        ? formatPercentage(
                                                              row.percentage,
                                                          )
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {row.description ?? '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-6 text-center text-slate-400"
                                            >
                                                No unilevel income recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                            <span>
                                Showing {from} {enDash} {to} of {total} records
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                {links.map((link, index) => {
                                    const label = formatPagerLabel(link.label);
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={`${label}-${index}`}
                                                className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-slate-100 px-2 text-slate-400"
                                            >
                                                {label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={`${label}-${index}`}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={cn(
                                                'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition',
                                                link.active
                                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700',
                                            )}
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default UnilevelIndex;
