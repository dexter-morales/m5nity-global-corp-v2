import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Filter, RefreshCcw, Search } from 'lucide-react';
import React, { useState } from 'react';

interface Activity {
    id: number;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: Record<string, any>;
    created_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
}

interface PaginatedActivities {
    data: Activity[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    activities: PaginatedActivities;
    log_names: string[];
    filters: {
        log_name?: string;
        causer_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

const ActivityLogs: React.FC = () => {
    const { props } = usePage<PageProps>();
    const { activities, log_names, filters } = props;

    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilter = () => {
        router.get(
            '/superadmin/activity-logs',
            localFilters as Record<string, string>,
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setLocalFilters({});
        router.get('/superadmin/activity-logs');
    };

    const getLogBadge = (logName: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive'
        > = {
            registration: 'default',
            pos_order: 'default',
            payment: 'default',
            release: 'default',
            cancellation: 'destructive',
            bulk_operation: 'secondary',
        };

        return (
            <Badge variant={variants[logName] || 'secondary'}>{logName}</Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Activity Logs" />
            <div className="space-y-6 p-6">
                <header>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Activity Logs
                    </h1>
                    <p className="text-sm text-slate-500">
                        View all system activities and user actions
                    </p>
                </header>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        <CardDescription>
                            Filter activity logs by type, user, date, or search
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Log Type
                                </label>
                                <Select
                                    value={localFilters.log_name || ''}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            log_name: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            All types
                                        </SelectItem>
                                        {log_names.map((name) => (
                                            <SelectItem key={name} value={name}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Date From
                                </label>
                                <Input
                                    type="date"
                                    value={localFilters.date_from || ''}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            date_from: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Date To
                                </label>
                                <Input
                                    type="date"
                                    value={localFilters.date_to || ''}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            date_to: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Search
                                </label>
                                <Input
                                    placeholder="Search description..."
                                    value={localFilters.search || ''}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            search: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleFilter}>
                                <Search className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Activity Logs ({activities.total} total)
                        </CardTitle>
                        <CardDescription>
                            Recent activities from all users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activities.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center"
                                        >
                                            No activity logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    activities.data.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell>
                                                {getLogBadge(activity.log_name)}
                                            </TableCell>
                                            <TableCell>
                                                {activity.description}
                                            </TableCell>
                                            <TableCell>
                                                {activity.causer ? (
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                activity.causer
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {
                                                                activity.causer
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        System
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    activity.created_at,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {Object.keys(
                                                    activity.properties || {},
                                                ).length > 0 && (
                                                    <details className="cursor-pointer">
                                                        <summary className="text-xs text-blue-600 hover:underline">
                                                            View data
                                                        </summary>
                                                        <pre className="mt-2 rounded bg-slate-100 p-2 text-xs">
                                                            {JSON.stringify(
                                                                activity.properties,
                                                                null,
                                                                2,
                                                            )}
                                                        </pre>
                                                    </details>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {activities.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Page {activities.current_page} of{' '}
                                    {activities.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {activities.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    `/superadmin/activity-logs?page=${activities.current_page - 1}`,
                                                )
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {activities.current_page <
                                        activities.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    `/superadmin/activity-logs?page=${activities.current_page + 1}`,
                                                )
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ActivityLogs;
