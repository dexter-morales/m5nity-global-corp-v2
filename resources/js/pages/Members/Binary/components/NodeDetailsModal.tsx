import type { BinaryNode } from '@/types/binary';
import React from 'react';

interface Props {
    node: BinaryNode | null;
    onClose: () => void;
    onViewGenealogy?: () => void;
}

const NodeDetailsModal: React.FC<Props> = ({
    node,
    onClose,
    onViewGenealogy,
}) => {
    if (!node) return null;

    const joinedAt = node.meta?.joined_at
        ? new Date(node.meta.joined_at).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'Not available';

    const leftGV =
        node.meta?.left_group_value !== undefined &&
        node.meta?.left_group_value !== null
            ? node.meta.left_group_value
            : 0;
    const rightGV =
        node.meta?.right_group_value !== undefined &&
        node.meta?.right_group_value !== null
            ? node.meta.right_group_value
            : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
                <div className="rounded-t-2xl bg-emerald-600 px-6 py-4 text-white">
                    <h2 className="text-lg font-semibold">Member's Details</h2>
                    <p className="text-sm text-emerald-100">
                        {node.meta?.member_name ??
                            node.meta?.account_name ??
                            'Member'}
                    </p>
                </div>

                <div className="space-y-6 px-6 py-5">
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/194/194938.png"
                            alt="Member avatar"
                            className="h-20 w-20 rounded-full border-4 border-emerald-400 bg-emerald-50 object-cover"
                        />
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-emerald-700">
                                {node.meta?.account_name ?? 'Account'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {node.user?.name ?? 'Paid Membership'}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoField
                            label="Username"
                            value={node.meta?.account_name}
                        />
                        <InfoField label="Joining Date" value={joinedAt} />
                        <InfoField
                            label="Direct Sponsor"
                            value={node.meta?.direct_sponsor_member}
                        />
                        <InfoField
                            label="Placement"
                            value={node.meta?.placement_account_name}
                        />
                        <InfoField
                            label="Placement Name"
                            value={node.meta?.placement_member_name}
                        />
                    </div>

                    <div>
                        <h4 className="mb-2 text-sm font-semibold text-slate-500 uppercase">
                            Group Value Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <StatCard label="Left GV" value={leftGV} />
                            <StatCard label="Right GV" value={rightGV} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 rounded-b-2xl bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onViewGenealogy}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        disabled={!onViewGenealogy}
                    >
                        View Genealogy
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

interface InfoFieldProps {
    label: string;
    value?: string | number | null;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {label}
        </span>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {value ? value : '—'}
        </span>
    </div>
);

interface StatCardProps {
    label: string;
    value: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
    <div className="rounded-lg bg-white p-4 text-center shadow">
        <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {label}
        </div>
        <div className="mt-1 text-lg font-bold text-emerald-600">{value}</div>
    </div>
);

export default NodeDetailsModal;
