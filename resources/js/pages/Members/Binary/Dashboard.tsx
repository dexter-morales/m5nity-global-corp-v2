import AppLayout from '@/layouts/app-layout';
import members from '@/routes/members';
import type { BreadcrumbItem, PageProps } from '@/types';
import type { BinaryNode, Payout } from '@/types/binary';
import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AddNodeModal from './AddNodeModal';
import TreeView from './Treeview';

export interface RegistrationPin {
    id: number;
    member_email: string;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    mobile_number?: string | null;
}

interface Props extends PageProps {
    tree: BinaryNode | null;
    payouts: Payout[];
    message?: string;
    availablePins: RegistrationPin[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Binary',
        href: members.binary.dashboard.url(),
    },
];

const Dashboard: React.FC<Props> = () => {
    const { props } = usePage<Props>();
    const { tree, payouts = [], message, availablePins = [] } = props;
    const [openModal, setOpenModal] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Binary Dashboard" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Binary Dashboard
                    </h1>
                    <button
                        onClick={() => setOpenModal(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        + Add Downline
                    </button>
                </div>

                {message && (
                    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-yellow-700">
                        {message}
                    </div>
                )}

                {tree ? (
                    <TreeView
                        rootNode={tree}
                        maxDepth={4}
                        nodeSize={72}
                        levelGap={120}
                    />
                ) : (
                    // <TreeView rootNode={tree} />
                    <div className="py-20 text-center text-gray-500">
                        You are not yet placed in the binary tree.
                    </div>
                )}

                {/* Payout Section */}
                {/* <section className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Recent Payouts</h2>
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="px-3 py-2">Level</th>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.length ? (
                            payouts.map((payout) => (
                                <tr key={payout.id} className="border-t">
                                    <td className="px-3 py-2">
                                        {payout.level}
                                    </td>
                                    <td className="px-3 py-2">
                                    {"PHP " + payout.amount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 capitalize">
                                        {payout.type}
                                    </td>
                                    <td className="px-3 py-2">
                                        {new Date(
                                            payout.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-3 py-4 text-center text-gray-400"
                                >
                                    No payouts yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section> */}

                <AddNodeModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    pins={availablePins}
                />
            </div>
        </AppLayout>
    );
};

export default Dashboard;
