import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { notifyError, notifySuccess } from '@/lib/notifier';
import type { BreadcrumbItem, PageProps, Paginated } from '@/types';
import type { Encashment } from '@/types/encashment';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    DollarSign,
    Eye,
    FileText,
    Filter,
    HandCoins,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    XCircle,
} from 'lucide-react';
import React from 'react';

interface EncashmentsPageProps extends PageProps {
    encashments: Paginated<Encashment>;
    filters?: {
        search?: string;
        status?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
    availableBalance?: number;
    totalIncome?: number;
    totalEncashed?: number;
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-blue-100 text-blue-800 border-blue-300',
    processed: 'bg-purple-100 text-purple-800 border-purple-300',
    released: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
};

const getBreadcrumbs = (
    userType: string | null | undefined,
): BreadcrumbItem[] => {
    const basePath =
        userType === 'member'
            ? '/encashments'
            : userType === 'admin' || userType === 'super_admin'
              ? '/admin/encashments'
              : userType === 'accounting'
                ? '/accounting/encashments'
                : '/cashier/encashments';

    return [
        {
            title: 'Encashments',
            href: basePath,
        },
    ];
};

const EncashmentsIndex: React.FC<EncashmentsPageProps> = ({
    encashments,
    filters = {},
    availableBalance = 0,
    totalIncome = 0,
    totalEncashed = 0,
}) => {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isMember = user?.utype === 'member';
    const isAdmin = user?.utype === 'admin' || user?.utype === 'super_admin';
    const isAccounting = user?.utype === 'accounting';
    const isCashier = user?.utype === 'cashier';

    const breadcrumbs = getBreadcrumbs(user?.utype);

    const [searchTerm, setSearchTerm] = React.useState(filters.search || '');
    const [statusFilter, setStatusFilter] = React.useState(
        filters.status || 'all',
    );
    const [isRequestDialogOpen, setIsRequestDialogOpen] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);

    // Request form state
    const [requestAmount, setRequestAmount] = React.useState('');
    const [requestNotes, setRequestNotes] = React.useState('');

    // Action dialogs state
    const [selectedEncashment, setSelectedEncashment] =
        React.useState<Encashment | null>(null);
    const [actionDialogType, setActionDialogType] = React.useState<
        'approve' | 'reject' | 'process' | 'release' | null
    >(null);
    const [actionNotes, setActionNotes] = React.useState('');
    const [rejectionReason, setRejectionReason] = React.useState('');
    const [paymentType, setPaymentType] = React.useState<string>('voucher');
    const [receivedByName, setReceivedByName] = React.useState('');

    const handleSearch = () => {
        router.get(
            window.location.pathname,
            {
                search: searchTerm || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            },
            { preserveState: true },
        );
    };

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestAmount || parseFloat(requestAmount) <= 0) {
            notifyError('Please enter a valid amount');
            return;
        }

        if (parseFloat(requestAmount) > availableBalance) {
            notifyError(
                `Amount exceeds available balance of ₱${availableBalance.toLocaleString()}`,
            );
            return;
        }

        setIsProcessing(true);
        router.post(
            '/encashments',
            {
                amount: requestAmount,
                member_notes: requestNotes,
            },
            {
                onSuccess: () => {
                    setIsRequestDialogOpen(false);
                    setRequestAmount('');
                    setRequestNotes('');
                    notifySuccess('Encashment request submitted successfully');
                },
                onError: (errors) => {
                    notifyError(
                        errors.amount ||
                            errors.message ||
                            'Failed to submit request',
                    );
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleApprove = () => {
        if (!selectedEncashment) return;
        setIsProcessing(true);

        const route = `/admin/encashments/${selectedEncashment.id}/approve`;
        router.post(
            route,
            { admin_notes: actionNotes },
            {
                onSuccess: () => {
                    setActionDialogType(null);
                    setSelectedEncashment(null);
                    setActionNotes('');
                    notifySuccess('Encashment approved successfully');
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to approve');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleReject = () => {
        if (!selectedEncashment || !rejectionReason) {
            notifyError('Please provide a rejection reason');
            return;
        }
        setIsProcessing(true);

        const route = `/admin/encashments/${selectedEncashment.id}/reject`;
        router.post(
            route,
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    setActionDialogType(null);
                    setSelectedEncashment(null);
                    setRejectionReason('');
                    notifySuccess('Encashment rejected');
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to reject');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleProcess = () => {
        if (!selectedEncashment) return;
        setIsProcessing(true);

        const route = `/accounting/encashments/${selectedEncashment.id}/process`;
        router.post(
            route,
            {
                payment_type: paymentType,
                accounting_notes: actionNotes,
            },
            {
                onSuccess: () => {
                    setActionDialogType(null);
                    setSelectedEncashment(null);
                    setActionNotes('');
                    notifySuccess('Encashment processed successfully');
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to process');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleRelease = () => {
        if (!selectedEncashment || !receivedByName) {
            notifyError('Please specify who received the payment');
            return;
        }
        setIsProcessing(true);

        const route = `/cashier/encashments/${selectedEncashment.id}/release`;
        router.post(
            route,
            {
                received_by_name: receivedByName,
                cashier_notes: actionNotes,
            },
            {
                onSuccess: () => {
                    setActionDialogType(null);
                    setSelectedEncashment(null);
                    setActionNotes('');
                    setReceivedByName('');
                    notifySuccess('Encashment released successfully');
                },
                onError: (errors) => {
                    notifyError(errors.message || 'Failed to release');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const viewEncashment = (encashment: Encashment) => {
        const baseRoute = isMember
            ? '/encashments'
            : isAdmin
              ? '/admin/encashments'
              : isAccounting
                ? '/accounting/encashments'
                : '/cashier/encashments';

        router.get(`${baseRoute}/${encashment.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Encashment Management" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Encashment Management
                    </h1>
                    <p className="text-muted-foreground">
                        {isMember
                            ? 'Request and track your income encashments'
                            : isAdmin
                              ? 'Review and approve encashment requests'
                              : isAccounting
                                ? 'Process approved encashments and generate vouchers'
                                : 'Release processed encashments to members'}
                    </p>
                </div>

                {/* Member Balance Cards */}
                {isMember && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Available Balance
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(availableBalance)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Ready for encashment
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Income
                                </CardTitle>
                                <HandCoins className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totalIncome)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All-time earnings
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Encashed
                                </CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totalEncashed)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Successfully withdrawn
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters and Actions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Encashment Requests</CardTitle>
                                <CardDescription>
                                    {encashments.total} total request(s)
                                </CardDescription>
                            </div>
                            {isMember && (
                                <Dialog
                                    open={isRequestDialogOpen}
                                    onOpenChange={setIsRequestDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            New Request
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={handleSubmitRequest}>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Request Encashment
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Submit a request to encash
                                                    your available income.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Available Balance
                                                    </Label>
                                                    <div className="rounded-md bg-muted p-3 text-lg font-semibold">
                                                        {formatCurrency(
                                                            availableBalance,
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="amount">
                                                        Amount to Encash
                                                        <span className="text-destructive">
                                                            {' '}
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        step="0.01"
                                                        min="100"
                                                        max={availableBalance}
                                                        value={requestAmount}
                                                        onChange={(e) =>
                                                            setRequestAmount(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Minimum: ₱100.00
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="notes">
                                                        Notes (Optional)
                                                    </Label>
                                                    <Textarea
                                                        id="notes"
                                                        value={requestNotes}
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLTextAreaElement>,
                                                        ) =>
                                                            setRequestNotes(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Add any additional notes..."
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setIsRequestDialogOpen(
                                                            false,
                                                        )
                                                    }
                                                    disabled={isProcessing}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        'Submit Request'
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search and Filter */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by member, encashment no, voucher no..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="processed">
                                        Processed
                                    </SelectItem>
                                    <SelectItem value="released">
                                        Released
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch} variant="secondary">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Apply
                            </Button>
                        </div>

                        <Separator />

                        {/* Encashment List */}
                        <div className="space-y-3">
                            {encashments.data.length === 0 ? (
                                <div className="py-12 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">
                                        No encashments found
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isMember
                                            ? 'Start by creating your first encashment request.'
                                            : 'No encashment requests match your criteria.'}
                                    </p>
                                </div>
                            ) : (
                                encashments.data.map((encashment) => (
                                    <Card
                                        key={encashment.id}
                                        className="transition-shadow hover:shadow-md"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-sm font-medium">
                                                            {
                                                                encashment.encashment_no
                                                            }
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                statusColors[
                                                                    encashment
                                                                        .status
                                                                ]
                                                            }
                                                        >
                                                            {encashment.status.toUpperCase()}
                                                        </Badge>
                                                        {encashment.voucher_no && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Voucher:{' '}
                                                                {
                                                                    encashment.voucher_no
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isMember && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">
                                                                {
                                                                    encashment
                                                                        .member
                                                                        .name
                                                                }
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {' '}
                                                                (
                                                                {
                                                                    encashment
                                                                        .member
                                                                        .MID
                                                                }
                                                                )
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>
                                                            {formatDate(
                                                                encashment.created_at,
                                                            )}
                                                        </span>
                                                        <span className="text-lg font-bold text-foreground">
                                                            {formatCurrency(
                                                                encashment.amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            viewEncashment(
                                                                encashment,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {isAdmin &&
                                                        encashment.status ===
                                                            'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedEncashment(
                                                                            encashment,
                                                                        );
                                                                        setActionDialogType(
                                                                            'approve',
                                                                        );
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        setSelectedEncashment(
                                                                            encashment,
                                                                        );
                                                                        setActionDialogType(
                                                                            'reject',
                                                                        );
                                                                    }}
                                                                >
                                                                    <XCircle className="mr-1 h-4 w-4" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    {isAccounting &&
                                                        encashment.status ===
                                                            'approved' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedEncashment(
                                                                        encashment,
                                                                    );
                                                                    setActionDialogType(
                                                                        'process',
                                                                    );
                                                                }}
                                                            >
                                                                <FileText className="mr-1 h-4 w-4" />
                                                                Process
                                                            </Button>
                                                        )}
                                                    {isCashier &&
                                                        encashment.status ===
                                                            'processed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedEncashment(
                                                                        encashment,
                                                                    );
                                                                    setActionDialogType(
                                                                        'release',
                                                                    );
                                                                }}
                                                            >
                                                                <HandCoins className="mr-1 h-4 w-4" />
                                                                Release
                                                            </Button>
                                                        )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {encashments.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {encashments.from} to{' '}
                                    {encashments.to} of {encashments.total}{' '}
                                    results
                                </div>
                                <div className="flex gap-2">
                                    {encashments.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url && router.get(link.url)
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Dialogs */}
                {/* Approve Dialog */}
                <Dialog
                    open={actionDialogType === 'approve'}
                    onOpenChange={(open) => {
                        if (!open) {
                            setActionDialogType(null);
                            setSelectedEncashment(null);
                            setActionNotes('');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Approve Encashment Request
                            </DialogTitle>
                            <DialogDescription>
                                Approve encashment request for{' '}
                                {selectedEncashment?.member.name} (
                                {formatCurrency(
                                    selectedEncashment?.amount || 0,
                                )}
                                )
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="admin-notes">
                                    Admin Notes (Optional)
                                </Label>
                                <Textarea
                                    id="admin-notes"
                                    value={actionNotes}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setActionNotes(e.target.value)}
                                    placeholder="Add any notes or comments..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setActionDialogType(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    'Approve Request'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog
                    open={actionDialogType === 'reject'}
                    onOpenChange={(open) => {
                        if (!open) {
                            setActionDialogType(null);
                            setSelectedEncashment(null);
                            setRejectionReason('');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Encashment Request</DialogTitle>
                            <DialogDescription>
                                Reject encashment request for{' '}
                                {selectedEncashment?.member.name} (
                                {formatCurrency(
                                    selectedEncashment?.amount || 0,
                                )}
                                )
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="rejection-reason">
                                    Rejection Reason
                                    <span className="text-destructive"> *</span>
                                </Label>
                                <Textarea
                                    id="rejection-reason"
                                    value={rejectionReason}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this request is being rejected..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setActionDialogType(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    'Reject Request'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Process Dialog */}
                <Dialog
                    open={actionDialogType === 'process'}
                    onOpenChange={(open) => {
                        if (!open) {
                            setActionDialogType(null);
                            setSelectedEncashment(null);
                            setActionNotes('');
                            setPaymentType('voucher');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Process Encashment</DialogTitle>
                            <DialogDescription>
                                Process and generate voucher for{' '}
                                {selectedEncashment?.member.name} (
                                {formatCurrency(
                                    selectedEncashment?.amount || 0,
                                )}
                                )
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="payment-type">
                                    Payment Type
                                    <span className="text-destructive"> *</span>
                                </Label>
                                <Select
                                    value={paymentType}
                                    onValueChange={setPaymentType}
                                >
                                    <SelectTrigger id="payment-type">
                                        <SelectValue placeholder="Select payment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="voucher">
                                            Voucher
                                        </SelectItem>
                                        <SelectItem value="cheque">
                                            Cheque
                                        </SelectItem>
                                        <SelectItem value="bank_transfer">
                                            Bank Transfer
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accounting-notes">
                                    Accounting Notes (Optional)
                                </Label>
                                <Textarea
                                    id="accounting-notes"
                                    value={actionNotes}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setActionNotes(e.target.value)}
                                    placeholder="Add any processing notes..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setActionDialogType(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleProcess}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Process & Generate Voucher'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Release Dialog */}
                <Dialog
                    open={actionDialogType === 'release'}
                    onOpenChange={(open) => {
                        if (!open) {
                            setActionDialogType(null);
                            setSelectedEncashment(null);
                            setActionNotes('');
                            setReceivedByName('');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Release Encashment</DialogTitle>
                            <DialogDescription>
                                Release payment to{' '}
                                {selectedEncashment?.member.name} (
                                {formatCurrency(
                                    selectedEncashment?.amount || 0,
                                )}
                                )
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="received-by">
                                    Received By
                                    <span className="text-destructive"> *</span>
                                </Label>
                                <Input
                                    id="received-by"
                                    type="text"
                                    value={receivedByName}
                                    onChange={(e) =>
                                        setReceivedByName(e.target.value)
                                    }
                                    placeholder="Enter name of person who received payment"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the name of the person who received
                                    the payment
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cashier-notes">
                                    Cashier Notes (Optional)
                                </Label>
                                <Textarea
                                    id="cashier-notes"
                                    value={actionNotes}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setActionNotes(e.target.value)}
                                    placeholder="Add any release notes..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setActionDialogType(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRelease}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Releasing...
                                    </>
                                ) : (
                                    'Release Payment'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default EncashmentsIndex;
