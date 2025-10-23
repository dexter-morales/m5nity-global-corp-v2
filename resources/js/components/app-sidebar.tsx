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
import { BookOpen, Folder, LayoutGrid, Network, Ticket } from 'lucide-react';
import AppLogo from './app-logo';

function buildNavItems(utype?: string | null): NavItem[] {
    const items: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (utype === 'member' || !utype) {
        items.push(
            {
                title: 'Binary',
                href: membersRoutes.binary.dashboard.url(),
                icon: Network,
            },
            {
                title: 'Income',
                href: membersRoutes.income.url(),
                icon: LayoutGrid,
            },
            {
                title: 'Pins',
                href: membersRoutes.pins.url(),
                icon: Ticket,
            },
        );
    }

    if (utype === 'cashier') {
        items.push({
            title: 'Registrations',
            href: cashierRoutes.registrations.index.url(),
            icon: Ticket,
        });
    }

    // Additional roles can be added similarly (admin, superadmin, accounting)
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
