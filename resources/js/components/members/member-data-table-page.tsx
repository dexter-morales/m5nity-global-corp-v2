import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Paginated, PaginationLinks, PaginationMeta } from "@/types";

type TableSummary = {
    from: number;
    to: number;
    total: number;
    enDash: string;
};

export interface SortButtonConfig {
    key: string;
    label: string;
    onClick: () => void;
    isActive: boolean;
    indicator?: React.ReactNode;
    className?: string;
}

export interface MemberDataTableColumn<T> {
    key: string;
    header: React.ReactNode;
    headerClassName?: string;
    cellClassName?: string | ((row: T) => string | undefined);
    render: (row: T) => React.ReactNode;
}

interface MemberDataTablePageProps<T> {
    headTitle: string;
    pageTitle: string;
    pageDescription: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    message?: string | null;
    tableTitle: string;
    tableDescription?: React.ReactNode | ((summary: TableSummary) => React.ReactNode);
    sortButtons?: SortButtonConfig[];
    paginated?: Paginated<T> | null;
    data?: T[];
    meta?: PaginationMeta;
    links?: PaginationLinks[];
    emptyMessage: string;
    totalLabel: string;
    getRowKey: (row: T, index: number) => React.Key;
    columns: MemberDataTableColumn<T>[];
    rowClassName?: (row: T, index: number) => string | undefined;
}

type LegacyPaginatorProps = {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
};

function createFallbackMeta(count: number): PaginationMeta {
    return {
        current_page: 1,
        last_page: 1,
        per_page: count || 10,
        from: count ? 1 : 0,
        to: count,
        total: count,
    };
}

function useResolvedMeta<T>(
    paginated: (Paginated<T> & LegacyPaginatorProps) | null | undefined,
    meta: PaginationMeta | undefined,
    data: T[],
): PaginationMeta {
    if (paginated?.meta) {
        return paginated.meta;
    }

    if (meta) {
        return meta;
    }

    const { current_page, last_page, per_page, from, to, total } =
        (paginated ?? {}) as LegacyPaginatorProps;

    if (
        current_page !== undefined ||
        last_page !== undefined ||
        per_page !== undefined ||
        from !== undefined ||
        to !== undefined ||
        total !== undefined
    ) {
        const page = current_page ?? 1;
        const size = per_page ?? (data.length || 10);
        const derivedFrom =
            from ?? (data.length ? (page - 1) * size + 1 : 0);
        const derivedTo =
            to ?? (data.length ? derivedFrom + data.length - 1 : 0);
        const derivedTotal =
            total ?? (data.length ? Math.max(data.length, derivedTo) : 0);
        const derivedLastPage =
            last_page ?? (size > 0 ? Math.max(1, Math.ceil(derivedTotal / size)) : 1);

        return {
            current_page: page,
            last_page: derivedLastPage,
            per_page: size,
            from: derivedFrom,
            to: derivedTo,
            total: derivedTotal,
        };
    }

    return createFallbackMeta(data.length);
}

function resolveLinks<T>(
    paginated: Paginated<T> | null | undefined,
    links: PaginationLinks[] | undefined,
): PaginationLinks[] {
    if (paginated?.links) {
        return paginated.links;
    }

    return links ?? [];
}

const MemberDataTablePage = <T,>({
    headTitle,
    pageTitle,
    pageDescription,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    message,
    tableTitle,
    tableDescription,
    sortButtons = [],
    paginated,
    data,
    meta,
    links,
    emptyMessage,
    totalLabel,
    getRowKey,
    columns,
    rowClassName,
}: MemberDataTablePageProps<T>) => {
    const rows = paginated?.data ?? data ?? [];
    const resolvedMeta = useResolvedMeta(paginated, meta, rows);
    const resolvedLinks = resolveLinks(paginated, links);

    const from =
        resolvedMeta.from ??
        (rows.length ? (resolvedMeta.current_page - 1) * resolvedMeta.per_page + 1 : 0);
    const to =
        resolvedMeta.to ??
        (rows.length ? Math.min(from + rows.length - 1, resolvedMeta.total) : 0);
    const enDash = String.fromCharCode(0x2013);

    const summary: TableSummary = {
        from,
        to,
        total: resolvedMeta.total,
        enDash,
    };

    const descriptionContent =
        typeof tableDescription === "function" ? tableDescription(summary) : tableDescription;

    const formatPagerLabel = (label: string) =>
        label
            .replace("&laquo;", String.fromCharCode(0x00ab))
            .replace("&raquo;", String.fromCharCode(0x00bb));

    return (
        <AppLayout>
            <Head title={headTitle} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">{pageTitle}</h1>
                        <p className="text-sm text-slate-500">{pageDescription}</p>
                    </div>
                    <div className="w-full max-w-xs">
                        <Input
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={searchPlaceholder}
                        />
                    </div>
                </div>

                {message && (
                    <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                        {message}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-700">{tableTitle}</h2>
                            {descriptionContent && (
                                <div className="text-sm text-slate-500">{descriptionContent}</div>
                            )}
                        </div>
                        {sortButtons.length > 0 && (
                            <div className="flex items-center gap-2">
                                {sortButtons.map((button) => (
                                    <Button
                                        key={button.key}
                                        variant="outline"
                                        size="sm"
                                        onClick={button.onClick}
                                        className={cn(
                                            "whitespace-nowrap",
                                            button.isActive && "bg-slate-100",
                                            button.className,
                                        )}
                                    >
                                        <span className="flex items-center gap-1">
                                            <span>{button.label}</span>
                                            {button.indicator && (
                                                <span className="text-xs text-slate-500">
                                                    {button.indicator}
                                                </span>
                                            )}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className={cn("px-4 py-3", column.headerClassName)}
                                            scope="col"
                                        >
                                            {column.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length > 0 ? (
                                    rows.map((row, index) => (
                                        <tr
                                            key={getRowKey(row, index)}
                                            className={cn(
                                                "hover:bg-slate-50",
                                                rowClassName?.(row, index),
                                            )}
                                        >
                                            {columns.map((column) => {
                                                const columnClass =
                                                    typeof column.cellClassName === "function"
                                                        ? column.cellClassName(row)
                                                        : column.cellClassName;
                                                return (
                                                    <td
                                                        key={column.key}
                                                        className={cn("px-4 py-3", columnClass)}
                                                    >
                                                        {column.render(row)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length || 1}
                                            className="px-4 py-6 text-center text-slate-400"
                                        >
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            Showing {from} {enDash} {to} of {resolvedMeta.total} {totalLabel}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {resolvedLinks.map((link, index) => {
                                const label = formatPagerLabel(link.label);
                                if (!link.url) {
                                    return (
                                        <span
                                            key={`${label}-${index}`}
                                            className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-slate-100 px-2 text-slate-400"
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
                                            "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 text-sm transition",
                                            link.active
                                                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
                                        )}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default MemberDataTablePage;
