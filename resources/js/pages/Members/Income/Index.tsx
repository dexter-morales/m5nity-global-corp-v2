import { useServerTableControls } from '@/components/data-table/use-server-table';
import MemberDataTablePage, {
    type MemberDataTableColumn,
    type SortButtonConfig,
} from '@/components/members/member-data-table-page';
import membersRoutes from '@/routes/members';
import type { Paginated } from '@/types';
import React from 'react';

type IncomeRecord = {
    id: number;
    amount: number;
    source: string;
    description?: string | null;
    created_at?: string | null;
    level?: number | null;
    left_account_id?: number | null;
    right_account_id?: number | null;
};

interface Props {
    incomes: Paginated<IncomeRecord>;
    message?: string | null;
    filters?: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

const IncomeIndex: React.FC<Props> = ({ incomes, message, filters = {} }) => {
    const { searchTerm, setSearchTerm, toggleSort, sortIndicator } =
        useServerTableControls({
            route: membersRoutes.income.url(),
            filters,
            defaultSort: 'date',
            defaultDirection: 'desc',
        });

    const formatDate = (value?: string | null) =>
        value ? new Date(value).toLocaleString() : '-';

    const formatAmount = (amount: number) => `PHP ${amount.toLocaleString()}`;

    const columns: MemberDataTableColumn<IncomeRecord>[] = [
        {
            key: 'created_at',
            header: 'Date',
            cellClassName: 'text-slate-600',
            render: (row) => formatDate(row.created_at),
        },
        {
            key: 'level',
            header: 'Level',
            cellClassName: 'text-slate-600',
            render: (row) => row.level ?? '-',
        },
        {
            key: 'amount',
            header: 'Amount',
            cellClassName: 'font-medium text-slate-800',
            render: (row) => formatAmount(row.amount),
        },
        {
            key: 'source',
            header: 'Source',
            cellClassName: 'text-slate-600',
            render: (row) => row.source,
        },
        {
            key: 'description',
            header: 'Description',
            cellClassName: 'text-slate-600',
            render: (row) => row.description ?? '-',
        },
    ];

    const sortButtons: SortButtonConfig[] = [
        {
            key: 'date',
            label: 'Date',
            onClick: () => toggleSort('date'),
            isActive: (filters.sort ?? 'date') === 'date',
            indicator: sortIndicator('date'),
        },
        {
            key: 'amount',
            label: 'Amount',
            onClick: () => toggleSort('amount'),
            isActive: filters.sort === 'amount',
            indicator: sortIndicator('amount'),
        },
    ];

    return (
        <MemberDataTablePage
            headTitle="Income History"
            pageTitle="Income History"
            pageDescription="Review recent binary pairing and unilevel commission earnings."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search income records..."
            message={message}
            tableTitle="Recent Earnings"
            tableDescription={({ from, to, total, enDash }) => (
                <p>
                    Showing {from} {enDash} {to} of {total} matching records.
                </p>
            )}
            sortButtons={sortButtons}
            paginated={incomes}
            emptyMessage="No income recorded yet."
            totalLabel="records"
            getRowKey={(row, index) =>
                row.created_at
                    ? `${row.id}-${row.created_at}`
                    : `income-${row.id}-${index}`
            }
            columns={columns}
        />
    );
};

export default IncomeIndex;
