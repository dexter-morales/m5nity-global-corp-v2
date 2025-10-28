import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const defaultExpanded = useMemo(() => {
        const expanded: Record<string, boolean> = {};
        items.forEach((item) => {
            if (item.children?.length) {
                const isActiveChild = item.children.some(
                    (child) =>
                        child.href &&
                        isSameUrl(page.url, resolveUrl(child.href)),
                );
                if (isActiveChild) {
                    expanded[item.title] = true;
                }
            }
        });
        return expanded;
    }, [items, page.url]);

    const [openGroups, setOpenGroups] =
        useState<Record<string, boolean>>(defaultExpanded);

    useEffect(() => {
        setOpenGroups((prev) => ({
            ...prev,
            ...defaultExpanded,
        }));
    }, [defaultExpanded]);

    const toggleGroup = (title: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.children?.length;
                    const isActive =
                        !hasChildren &&
                        item.href &&
                        isSameUrl(page.url, resolveUrl(item.href));
                    const groupOpen = openGroups[item.title] ?? false;

                    if (hasChildren) {
                        const childIsActive = item.children.some(
                            (child) =>
                                child.href &&
                                isSameUrl(page.url, resolveUrl(child.href)),
                        );

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    type="button"
                                    className="w-full justify-between"
                                    onClick={() => toggleGroup(item.title)}
                                    isActive={childIsActive}
                                    data-state={groupOpen ? 'open' : 'closed'}
                                >
                                    <span className="flex items-center gap-2">
                                        {item.icon && <item.icon width={16} />}
                                        <span>{item.title}</span>
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'ml-2 size-4 transition-transform',
                                            groupOpen && 'rotate-180',
                                        )}
                                    />
                                </SidebarMenuButton>
                                {groupOpen && (
                                    <SidebarMenuSub>
                                        {item.children.map((child) => {
                                            const childActive =
                                                !!child.href &&
                                                isSameUrl(
                                                    page.url,
                                                    resolveUrl(child.href),
                                                );
                                            return (
                                                <SidebarMenuSubItem
                                                    key={`${item.title}-${child.title}`}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={childActive}
                                                    >
                                                        <Link
                                                            href={
                                                                child.href ??
                                                                '#'
                                                            }
                                                            prefetch
                                                        >
                                                            {child.icon && (
                                                                <child.icon />
                                                            )}
                                                            <span>
                                                                {child.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href ?? '#'} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
