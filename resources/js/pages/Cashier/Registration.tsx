import AppLayout from '@/layouts/app-layout';
// import cashier from '@/routes/cashier';
import cashier from '@/routes/cashier';

import { notifyError } from '@/lib/notifier';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React from 'react';

// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

type AccountOption = {
    id: number;
    account_name: string;
    member_name?: string | null;
    mid?: string | null;
};

type TransactionRecord = {
    id: number;
    trans_no: string;
    payment_method?: string | null;
    member_email: string;
    pin?: string | null;
    created_at?: string | null;
};

interface PageProps extends Record<string, unknown> {
    accounts: AccountOption[];
    transactions: TransactionRecord[];
    profile?: {
        first_name: string;
        middle_name?: string | null;
        last_name: string;
        role: string;
        department?: string | null;
        contact_number?: string | null;
    } | null;
    flash?: {
        success?: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cashier',
        href: cashier.registrations.index.url(),
    },
];

const Registration: React.FC = () => {
    const { props } = usePage<PageProps>();
    const { accounts = [], transactions = [], flash, profile } = props;

    const form = useForm({
        payment_method: '',
        sponsor_account_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        mobile_number: '',
        email: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            sponsor_account_id: data.sponsor_account_id
                ? Number(data.sponsor_account_id)
                : null,
        }));

        form.post(cashier.registrations.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset(
                    'payment_method',
                    'sponsor_account_id',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'mobile_number',
                    'email',
                );
                // Refresh transactions list reactively
                router.reload({ only: ['transactions'] });
            },
            onError: (errors) => {
                const first = Object.values(errors)[0] as string | undefined;
                if (first) notifyError(first);
            },
        });
    };

    return (
        // <AuthenticatedLayout
        // header={
        //     <h2 className="text-xl font-semibold leading-tight text-gray-800">
        //         Members
        //     </h2>
        // }
        // >

        // </AuthenticatedLayout>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cashier Registration" />
            <div className="space-y-8 p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">
                            Cashier Registration
                        </h1>
                        <p className="text-sm text-slate-500">
                            Register new members, generate pins, and review your
                            transaction history.
                        </p>
                    </div>
                    {profile && (
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                            <p className="font-semibold text-slate-800">
                                {profile.first_name}{' '}
                                {profile.middle_name
                                    ? profile.middle_name + ' '
                                    : ''}
                                {profile.last_name}
                            </p>
                            <p className="text-xs tracking-wide text-emerald-600 uppercase">
                                {profile.role}
                            </p>
                            {profile.department && (
                                <p className="text-xs text-slate-500">
                                    Department: {profile.department}
                                </p>
                            )}
                            {profile.contact_number && (
                                <p className="text-xs text-slate-500">
                                    Contact: {profile.contact_number}
                                </p>
                            )}
                        </div>
                    )}
                </header>

                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-slate-700">
                            Member Details
                        </h2>
                        <p className="text-sm text-slate-500">
                            Provide the member&apos;s basic information.
                            Password is preset to <code>password123</code> and
                            can be changed by the member later.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6 px-6 py-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="First Name"
                                value={form.data.first_name}
                                onChange={(value) =>
                                    form.setData('first_name', value)
                                }
                                error={form.errors.first_name}
                                required
                            />
                            <FormField
                                label="Middle Name"
                                value={form.data.middle_name}
                                onChange={(value) =>
                                    form.setData('middle_name', value)
                                }
                                error={form.errors.middle_name}
                            />
                            <FormField
                                label="Last Name"
                                value={form.data.last_name}
                                onChange={(value) =>
                                    form.setData('last_name', value)
                                }
                                error={form.errors.last_name}
                                required
                            />
                            <FormField
                                label="Mobile Number"
                                value={form.data.mobile_number}
                                onChange={(value) =>
                                    form.setData('mobile_number', value)
                                }
                                error={form.errors.mobile_number}
                                required
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="Email Address"
                                type="email"
                                value={form.data.email}
                                onChange={(value) =>
                                    form.setData('email', value)
                                }
                                error={form.errors.email}
                                required
                            />
                            <FormField
                                label="Payment Method"
                                value={form.data.payment_method}
                                onChange={(value) =>
                                    form.setData('payment_method', value)
                                }
                                error={form.errors.payment_method}
                                required
                                placeholder="e.g. GCash, Bank Transfer"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-600">
                                    Sponsor Account
                                </label>
                            <SearchableSelect
                                items={accounts.map((a) => ({
                                    value: String(a.id),
                                    label: `${a.member_name ?? a.account_name}${a.mid ? ` (${a.mid})` : ''}`,
                                }))}
                                value={form.data.sponsor_account_id}
                                onValueChange={(v) => form.setData('sponsor_account_id', v)}
                                placeholder="Auto-assign later"
                            />
                                {form.errors.sponsor_account_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.sponsor_account_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? 'Processing...'
                                    : 'Register Member'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-slate-700">
                            Transaction History
                        </h2>
                        <p className="text-sm text-slate-500">
                            Latest 50 registrations processed by this cashier.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Transaction #</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Pin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.length ? (
                                    transactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3 text-slate-600">
                                                {tx.created_at
                                                    ? new Date(
                                                          tx.created_at,
                                                      ).toLocaleString()
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {tx.trans_no}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {tx.payment_method ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {tx.member_email}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-slate-800">
                                                {tx.pin ?? '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-6 text-center text-slate-400"
                                        >
                                            No transactions yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
};

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    placeholder,
}) => (
    <div>
        <label className="mb-1 block text-sm font-semibold text-slate-600">
            {label}
            {required && <span className="text-red-500"> *</span>}
        </label>
        <Input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={required}
            placeholder={placeholder}
            aria-invalid={!!error}
            className={cn(
                'bg-white border-slate-300',
                // Customized brand focus color (emerald)
                'focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50',
                // Error styling
                error && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30'
            )}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

export default Registration;
