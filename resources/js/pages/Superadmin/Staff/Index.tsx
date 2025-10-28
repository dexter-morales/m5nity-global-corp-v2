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
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    utype: string;
    created_at: string;
    staff_profile?: {
        role: string;
        department?: string;
    };
}

interface Props {
    staff: {
        data: StaffMember[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        role?: string;
    };
    roles: Record<string, string>;
}

export default function StaffIndex({ staff, filters, roles }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = () => {
        router.get(
            '/superadmin/staff',
            { search, role: role === 'all' ? undefined : role },
            { preserveState: true },
        );
    };

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/superadmin/staff/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getRoleBadgeVariant = (utype: string) => {
        switch (utype) {
            case 'superadmin':
                return 'destructive';
            case 'admin':
                return 'default';
            case 'cashier':
                return 'secondary';
            case 'accounting':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Superadmin', href: '/superadmin' },
                { title: 'Staff Management', href: '/superadmin/staff' },
            ]}
        >
            <Head title="Staff Management" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Staff Management</h1>
                        <p className="text-muted-foreground">
                            Manage employees, cashiers, admins, and other staff
                            members
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/superadmin/staff/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Staff Member
                        </Link>
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                            className="pl-10"
                        />
                    </div>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {Object.entries(roles).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSearch}>Search</Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        No staff members found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staff.data.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">
                                            {member.name}
                                        </TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getRoleBadgeVariant(
                                                    member.utype,
                                                )}
                                            >
                                                {roles[member.utype] ||
                                                    member.utype}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {member.staff_profile?.department ||
                                                '-'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                member.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/superadmin/staff/${member.id}/edit`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDeleteId(member.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {staff.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {staff.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog
                open={deleteId !== null}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the staff member and their profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
