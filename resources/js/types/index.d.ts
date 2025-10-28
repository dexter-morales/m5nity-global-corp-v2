import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    accounts?: MemberAccountSummary[];
    activeAccountId?: number | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLinks[];
    meta: PaginationMeta;
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    utype?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface MemberAccountSummary {
    id: number;
    name: string;
    package_type?: string | null;
    member_type?: string | null;
    is_main?: boolean;
    is_main_account?: boolean;
}

export interface PageProps {
    auth: {
        user: User;
        accounts?: MemberAccountSummary[];
        activeAccountId?: number | null;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}
