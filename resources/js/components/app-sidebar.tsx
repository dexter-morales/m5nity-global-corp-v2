import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import cashierRoutes from '@/routes/cashier';
import membersRoutes from '@/routes/members';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    BookOpen,
    CircleDollarSign,
    FileText,
    Folder,
    HandCoins,
    LayoutGrid,
    Network,
    Package,
    Settings,
    ShoppingCart,
    Ticket,
    TrendingUp,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

function buildNavItems(utype?: string | null): NavItem[] {
    const items: NavItem[] = [];

    if (utype === 'member' || !utype) {
        items.push({
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        });
        items.push(
            {
                title: 'Binary',
                href: membersRoutes.binary.dashboard.url(),
                icon: Network,
            },
            {
                title: 'Unilevel',
                href: membersRoutes.unilevel.url(),
                icon: TrendingUp,
            },
            {
                title: 'Transactions',
                icon: CircleDollarSign,
                children: [
                    {
                        title: 'Income History',
                        href: membersRoutes.income.url(),
                    },
                    {
                        title: 'Pay-out Transactions',
                        href: membersRoutes.payouts.url(),
                    },
                    {
                        title: 'Encashments',
                        href: '/encashments',
                    },
                ],
            },
            {
                title: 'Pins',
                href: membersRoutes.pins.url(),
                icon: Ticket,
            },
        );
    }

    if (utype === 'cashier') {
        items.push(
            {
                title: 'Dashboard',
                href: '/cashier',
                icon: LayoutGrid,
            },
            {
                title: 'Registrations',
                href: cashierRoutes.registrations.index.url(),
                icon: Ticket,
            },
            {
                title: 'POS',
                href: cashierRoutes.pos.index.url(),
                icon: ShoppingCart,
            },
            {
                title: 'Inventory',
                icon: Package,
                children: [
                    {
                        title: 'Products',
                        href: '/inventory/products',
                    },
                    {
                        title: 'Packages',
                        href: '/inventory/packages',
                    },
                ],
            },
            {
                title: 'Encashments',
                href: '/cashier/encashments',
                icon: HandCoins,
            },
            {
                title: 'Reports',
                href: cashierRoutes.reports.url(),
                icon: FileText,
            },
        );
    }

    // Releasing Personnel - Read-only view of orders and registrations
    if (utype === 'releasing_personnel') {
        items.push(
            {
                title: 'Dashboard',
                href: '/releasing',
                icon: LayoutGrid,
            },
            {
                title: 'Orders',
                href: '/releasing/orders',
                icon: ShoppingCart,
            },
            {
                title: 'Registrations',
                href: '/releasing/registrations',
                icon: Ticket,
            },
            {
                title: 'Inventory',
                icon: Package,
                children: [
                    {
                        title: 'Products',
                        href: '/inventory/products',
                    },
                    {
                        title: 'Packages',
                        href: '/inventory/packages',
                    },
                ],
            },
            {
                title: 'Inventory Reports',
                href: '/inventory/reports',
                icon: BarChart3,
            },
        );
    }

    // Superadmin - Full access to all features
    if (utype === 'superadmin') {
        items.push(
            {
                title: 'Dashboard',
                href: '/superadmin',
                icon: LayoutGrid,
            },
            {
                title: 'Staff Management',
                href: '/superadmin/staff',
                icon: Users,
            },
            {
                title: 'Activity Logs',
                href: '/superadmin/activity-logs',
                icon: FileText,
            },
            {
                title: 'Reverb Test',
                href: '/reverb-test',
                icon: Activity,
            },
            {
                title: 'Members',
                icon: Network,
                children: [
                    {
                        title: 'Overview',
                        href: '/dashboard',
                    },
                    {
                        title: 'Binary',
                        href: membersRoutes.binary.dashboard.url(),
                    },
                    {
                        title: 'Unilevel',
                        href: membersRoutes.unilevel.url(),
                    },
                ],
            },
            {
                title: 'Sales',
                icon: ShoppingCart,
                children: [
                    {
                        title: 'Registrations',
                        href: cashierRoutes.registrations.index.url(),
                    },
                    {
                        title: 'POS',
                        href: cashierRoutes.pos.index.url(),
                    },
                    {
                        title: 'Reports',
                        href: cashierRoutes.reports.url(),
                    },
                ],
            },
            {
                title: 'Inventory',
                icon: Package,
                children: [
                    {
                        title: 'Products',
                        href: '/inventory/products',
                    },
                    {
                        title: 'Packages',
                        href: '/inventory/packages',
                    },
                    {
                        title: 'Reports',
                        href: '/inventory/reports',
                    },
                ],
            },
            {
                title: 'Encashments',
                icon: HandCoins,
                children: [
                    {
                        title: 'Admin View',
                        href: '/admin/encashments',
                    },
                    {
                        title: 'Accounting View',
                        href: '/accounting/encashments',
                    },
                    {
                        title: 'Cashier View',
                        href: '/cashier/encashments',
                    },
                ],
            },
            {
                title: 'Settings',
                icon: Settings,
                children: [
                    {
                        title: 'Company Settings',
                        href: '/superadmin/settings/company',
                    },
                ],
            },
        );
    }

    // Additional roles can be added similarly (admin, accounting)
    if (utype === 'admin' || utype === 'super_admin') {
        items.push(
            { title: 'Admin', href: '/admin', icon: LayoutGrid },
            {
                title: 'Inventory',
                icon: Package,
                children: [
                    {
                        title: 'Products',
                        href: '/inventory/products',
                    },
                    {
                        title: 'Packages',
                        href: '/inventory/packages',
                    },
                    {
                        title: 'Reports',
                        href: '/inventory/reports',
                    },
                ],
            },
            {
                title: 'Encashments',
                href: '/admin/encashments',
                icon: HandCoins,
            },
        );
    }

    if (utype === 'accounting') {
        items.push(
            {
                title: 'Accounting',
                href: '/accounting',
                icon: LayoutGrid,
            },
            {
                title: 'Encashments',
                href: '/accounting/encashments',
                icon: HandCoins,
            },
        );
    }
    return items;
}

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { props } = usePage();
    // @ts-expect-error runtime prop from inertia middleware
    const utype: string | undefined = props?.auth?.user?.utype ?? undefined;
    const mainNavItems = buildNavItems(utype);
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
