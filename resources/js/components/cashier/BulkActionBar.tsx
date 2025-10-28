import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Package, XCircle } from 'lucide-react';
import React from 'react';

interface BulkActionBarProps {
    selectedCount: number;
    onMarkAsPaid?: () => void;
    onMarkAsReleased?: () => void;
    onCancel?: () => void;
    onClearSelection: () => void;
    showMarkAsPaid?: boolean;
    showMarkAsReleased?: boolean;
    showCancel?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    selectedCount,
    onMarkAsPaid,
    onMarkAsReleased,
    onCancel,
    onClearSelection,
    showMarkAsPaid = false,
    showMarkAsReleased = false,
    showCancel = false,
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed right-4 bottom-20 z-40 animate-in slide-in-from-bottom-10 fade-in">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox checked disabled />
                        <span className="text-sm font-semibold text-slate-700">
                            {selectedCount} selected
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {showMarkAsPaid && onMarkAsPaid && (
                            <Button
                                size="sm"
                                onClick={onMarkAsPaid}
                                className="gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Mark as Paid
                            </Button>
                        )}

                        {showMarkAsReleased && onMarkAsReleased && (
                            <Button
                                size="sm"
                                onClick={onMarkAsReleased}
                                className="gap-2"
                            >
                                <Package className="h-4 w-4" />
                                Release Orders
                            </Button>
                        )}

                        {showCancel && onCancel && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={onCancel}
                                className="gap-2"
                            >
                                <XCircle className="h-4 w-4" />
                                Cancel
                            </Button>
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onClearSelection}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
