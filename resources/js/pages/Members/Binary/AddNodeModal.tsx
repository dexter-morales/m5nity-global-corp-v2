import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { notifyError, notifySuccess } from "@/lib/notifier";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { RegistrationPin } from "./Dashboard";

interface Props {
    open: boolean;
    onClose: () => void;
    pins: RegistrationPin[];
}

type Feedback = {
    type: "success" | "error";
    text: string;
};

const AddNodeModal: React.FC<Props> = ({ open, onClose, pins }) => {
    const [accountName, setAccountName] = useState("");
    const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
    const [isExtension, setIsExtension] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const selectedPin = useMemo(
        () => pins.find((pin) => pin.id === selectedPinId) ?? null,
        [pins, selectedPinId]
    );

    useEffect(() => {
        if (!open) {
            setAccountName("");
            setSelectedPinId(null);
            setIsExtension(false);
            setFeedback(null);
            return;
        }

        if (pins.length === 1) {
            setSelectedPinId(pins[0].id);
        }
    }, [open, pins]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedPinId) {
            setFeedback({
                type: "error",
                text: "Please select a registration email.",
            });
            return;
        }

        setLoading(true);
        setFeedback(null);

        try {
            await axios.post("/binary/register", {
                account_name: accountName,
                member_pin_id: selectedPinId,
                is_extension: isExtension,
            });

            setFeedback({
                type: "success",
                text: "Downline registered successfully.",
            });
            notifySuccess("Downline registered successfully.");

            // Refresh dashboard data reactively (tree, pins, payouts)
            router.reload({ only: ["tree", "availablePins", "payouts"] });
            setAccountName("");
            setSelectedPinId(null);
            setIsExtension(false);
        } catch (error: any) {
            const message =
                error.response?.data?.message ??
                "We were not able to complete the registration. Please try again.";
            setFeedback({
                type: "error",
                text: message,
            });
            notifyError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return null;
    }

    const noPinsAvailable = pins.length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between rounded-t-2xl bg-emerald-700 px-6 py-4 text-white">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Entrepreneur Registration Form
                        </h2>
                        <p className="text-xs text-emerald-100">
                            Select a pre-registered member to place them in your
                            genealogy.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600">
                                Available Emails
                            </label>
                            <SearchableSelect
                                items={pins.map((p) => ({ value: String(p.id), label: p.member_email }))}
                                value={selectedPinId ? String(selectedPinId) : ''}
                                onValueChange={(v) => setSelectedPinId(v ? Number(v) : null)}
                                placeholder={noPinsAvailable ? "No available registrations" : "Select email"}
                                includeAutoOption={false}
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                These emails were pre-registered by the cashier.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Account Name <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3">
                                <span className="pr-2 text-slate-400">@</span>
                                <Input
                                    type="text"
                                    className="h-11 w-full border-0 shadow-none focus-visible:ring-0"
                                    placeholder="Choose a unique account name"
                                    value={accountName}
                                    onChange={(event) => setAccountName(event.target.value)}
                                    required
                                    disabled={noPinsAvailable}
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Account names are case-sensitive and cannot be changed.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <ReadOnlyField
                            label="First Name"
                            value={selectedPin?.first_name}
                        />
                        <ReadOnlyField
                            label="Middle Name"
                            value={selectedPin?.middle_name}
                        />
                        <ReadOnlyField
                            label="Last Name"
                            value={selectedPin?.last_name}
                        />
                        <ReadOnlyField
                            label="Mobile Number"
                            value={selectedPin?.mobile_number}
                        />
                    </div>

                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <strong className="font-semibold uppercase">Note:</strong>{" "}
                        Registration information is locked because it was already
                        supplied during cashier pre-registration.
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                            <Checkbox
                                checked={isExtension}
                                onCheckedChange={(checked) => setIsExtension(Boolean(checked))}
                                disabled={noPinsAvailable}
                            />
                            Mark as extension account
                        </label>
                    </div>

                    {feedback && (
                        <div
                            className={`rounded-lg px-4 py-3 text-sm ${
                                feedback.type === "success"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600"
                            }`}
                        >
                            {feedback.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={
                                loading || noPinsAvailable || !selectedPinId || !accountName
                            }
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ReadOnlyFieldProps {
    label: string;
    value?: string | null;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, value }) => (
    <div>
        <label className="mb-1 block text-sm font-semibold text-slate-600">
            {label}
        </label>
        <Input
            type="text"
            value={value ?? ""}
            readOnly
            className="w-full cursor-not-allowed border-slate-200 bg-slate-100"
        />
    </div>
);

export default AddNodeModal;
