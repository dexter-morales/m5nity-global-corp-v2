import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeRegistrations } from '@/hooks/useRealtimeRegistrations';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, Package } from 'lucide-react';
import React, { useState } from 'react';

interface Registration {
    id: number;
    transaction_number: string;
    account_id: string;
    member_name: string;
    package_name: string;
    package_price: number;
    payment_method: string;
    status: 'pending' | 'for_release' | 'completed';
    created_at: string;
    updated_at: string;
}

interface PageProps {
    for_release_registrations: Registration[];
    completed_registrations: Registration[];
}

const ReleasingRegistrations: React.FC = () => {
    const { props } = usePage<PageProps>();
    const { for_release_registrations = [], completed_registrations = [] } =
        props;

    // Enable real-time registration updates
    useRealtimeRegistrations();

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        registrationId: number | null;
        transactionNumber: string;
        memberName: string;
    }>({
        open: false,
        registrationId: null,
        transactionNumber: '',
        memberName: '',
    });

    const handleMarkAsReleased = (
        registrationId: number,
        transactionNumber: string,
        memberName: string,
    ) => {
        setConfirmDialog({
            open: true,
            registrationId,
            transactionNumber,
            memberName,
        });
    };

    const confirmRelease = () => {
        if (!confirmDialog.registrationId) return;

        router.post(
            `/releasing/registrations/${confirmDialog.registrationId}/release`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmDialog({
                        open: false,
                        registrationId: null,
                        transactionNumber: '',
                        memberName: '',
                    });
                },
                onError: () => {
                    setConfirmDialog({
                        open: false,
                        registrationId: null,
                        transactionNumber: '',
                        memberName: '',
                    });
                },
            },
        );
    };

    const getStatusBadge = (status: Registration['status']) => {
        const variants = {
            pending: 'secondary',
            for_release: 'default',
            completed: 'default',
        } as const;

        const labels = {
            pending: 'Pending',
            for_release: 'For Release',
            completed: 'Completed',
        };

        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    };

    const renderRegistrationsTable = (
        registrations: Registration[],
        showReleaseButton: boolean,
    ) => {
        if (registrations.length === 0) {
            return (
                <div className="py-8 text-center text-slate-500">
                    No registrations found
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction #</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        {showReleaseButton && <TableHead>Action</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {registrations.map((registration) => (
                        <TableRow key={registration.id}>
                            <TableCell className="font-medium">
                                {registration.transaction_number}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">
                                        {registration.member_name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {registration.account_id}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{registration.package_name}</TableCell>
                            <TableCell>
                                {formatCurrency(registration.package_price)}
                            </TableCell>
                            <TableCell>{registration.payment_method}</TableCell>
                            <TableCell>
                                {getStatusBadge(registration.status)}
                            </TableCell>
                            <TableCell>
                                {new Date(
                                    registration.created_at,
                                ).toLocaleDateString()}
                            </TableCell>
                            {showReleaseButton && (
                                <TableCell>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleMarkAsReleased(
                                                registration.id,
                                                registration.transaction_number,
                                                registration.member_name,
                                            )
                                        }
                                    >
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Release
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <AppLayout>
            <Head title="Registrations - Releasing" />
            <div className="space-y-6 p-6">
                <header>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Registration Management
                    </h1>
                    <p className="text-sm text-slate-500">
                        View and release registration packages to new members
                    </p>
                </header>

                <Tabs defaultValue="for_release" className="w-full">
                    <TabsList>
                        <TabsTrigger value="for_release">
                            <Package className="mr-2 h-4 w-4" />
                            For Release ({for_release_registrations.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completed ({completed_registrations.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="for_release">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Registrations Ready for Release
                                </CardTitle>
                                <CardDescription>
                                    Registration packages that are ready to be
                                    released to new members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderRegistrationsTable(
                                    for_release_registrations,
                                    true,
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="completed">
                        <Card>
                            <CardHeader>
                                <CardTitle>Completed Registrations</CardTitle>
                                <CardDescription>
                                    Registrations that have been released to
                                    members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderRegistrationsTable(
                                    completed_registrations,
                                    false,
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Confirmation Dialog */}
                <AlertDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) =>
                        !open &&
                        setConfirmDialog({
                            open: false,
                            registrationId: null,
                            transactionNumber: '',
                            memberName: '',
                        })
                    }
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Registration Release
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to mark the registration
                                package for{' '}
                                <span className="font-semibold">
                                    {confirmDialog.memberName}
                                </span>{' '}
                                (Transaction:{' '}
                                <span className="font-semibold">
                                    {confirmDialog.transactionNumber}
                                </span>
                                ) as released? This action indicates that the
                                registration package has been delivered to the
                                new member.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRelease}>
                                Confirm Release
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
};

export default ReleasingRegistrations;
