import React from "react";
import membersRoutes from "@/routes/members";
import { useServerTableControls } from "@/components/data-table/use-server-table";
import MemberDataTablePage, {
    type MemberDataTableColumn,
    type SortButtonConfig,
} from "@/components/members/member-data-table-page";
import type { Paginated } from "@/types";

type PayoutRecord = {
    id: number;
    level?: number | null;
    amount: number;
    type: string;
    created_at?: string | null;
};

interface Props {
    payouts: Paginated<PayoutRecord>;
    message?: string | null;
    filters?: {
        search?: string;
        sort?: string;
        direction?: "asc" | "desc";
    };
}

const PayoutIndex: React.FC<Props> = ({ payouts, message, filters = {} }) => {
    const { searchTerm, setSearchTerm, toggleSort, sortIndicator } =
        useServerTableControls({
            route: membersRoutes.payouts.url(),
            filters,
            defaultSort: "created_at",
            defaultDirection: "desc",
        });

    const formatDate = (value?: string | null) =>
        value ? new Date(value).toLocaleString() : "-";

    const formatAmount = (value: number) => `PHP ${value.toLocaleString()}`;

    const columns: MemberDataTableColumn<PayoutRecord>[] = [
        {
            key: "created_at",
            header: "Date",
            cellClassName: "text-slate-600",
            render: (row) => formatDate(row.created_at),
        },
        {
            key: "level",
            header: "Level",
            cellClassName: "text-slate-600",
            render: (row) => row.level ?? "-",
        },
        {
            key: "amount",
            header: "Amount",
            cellClassName: "font-medium text-slate-800",
            render: (row) => formatAmount(row.amount),
        },
        {
            key: "type",
            header: "Type",
            cellClassName: "text-slate-600 capitalize",
            render: (row) => row.type,
        },
    ];

    const sortButtons: SortButtonConfig[] = [
        {
            key: "created_at",
            label: "Date",
            onClick: () => toggleSort("created_at"),
            isActive: (filters.sort ?? "created_at") === "created_at",
            indicator: sortIndicator("created_at"),
        },
        {
            key: "amount",
            label: "Amount",
            onClick: () => toggleSort("amount"),
            isActive: filters.sort === "amount",
            indicator: sortIndicator("amount"),
        },
    ];

    return (
        <MemberDataTablePage
            headTitle="Payout Transactions"
            pageTitle="Pay-out Transaction History"
            pageDescription="Review cash-out activities recorded on your account."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search payouts..."
            message={message}
            tableTitle="Recent Payouts"
            tableDescription={({ from, to, total, enDash }) => (
                <p>
                    Showing {from} {enDash} {to} of {total} matching transactions.
                </p>
            )}
            sortButtons={sortButtons}
            paginated={payouts}
            emptyMessage="No payouts recorded yet."
            totalLabel="payouts"
            getRowKey={(row) => row.id}
            columns={columns}
        />
    );
};

export default PayoutIndex;
