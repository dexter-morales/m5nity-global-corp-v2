import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { MemberAccountSummary, SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function formatPlan(plan?: string | null): string {
    if (!plan) {
        return 'Free';
    }

    return plan
        .toString()
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name?: string | null): string {
    if (!name) {
        return '?';
    }

    const trimmed = name.trim();

    if (!trimmed) {
        return '?';
    }

    const parts = trimmed.split(/\s+/);
    const initials =
        (parts[0]?.[0] ?? '') +
        (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '');

    return initials.length
        ? initials.toUpperCase()
        : trimmed.slice(0, 2).toUpperCase();
}

function AccountMenuItem({
    account,
    isActive,
    onSelect,
}: {
    account: MemberAccountSummary;
    isActive: boolean;
    onSelect: (account: MemberAccountSummary) => void;
}) {
    const plan = formatPlan(account.package_type);
    const primary = isAccountMain(account);

    return (
        <DropdownMenuItem
            onClick={() => onSelect(account)}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground',
            )}
            data-state={isActive ? 'active' : 'inactive'}
        >
            <Avatar className="size-9 shadow-sm ring-1 ring-border/70">
                <AvatarFallback
                    className={cn(
                        'bg-primary/10 font-medium text-primary',
                        primary ? 'bg-primary/20 text-primary-foreground' : '',
                    )}
                >
                    {getInitials(account.name)}
                </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-foreground">
                    {account.name ?? 'Unnamed Account'}
                </span>
                {primary ? (
                    <span className="text-xs text-muted-foreground">
                        Primary account
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Sub account
                    </span>
                )}
            </div>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {plan}
            </span>
        </DropdownMenuItem>
    );
}

function isAccountMain(account: MemberAccountSummary | undefined): boolean {
    if (!account) return false;
    if (typeof account.is_main === 'boolean') return account.is_main;
    if (typeof account.is_main_account === 'boolean')
        return account.is_main_account;
    return false;
}

export function AccountSwitcher() {
    const { auth } = usePage<SharedData>().props;
    const accounts = auth?.accounts ?? [];
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
        auth?.activeAccountId ?? null,
    );

    console.log('Auth:', JSON.parse(JSON.stringify(auth)));
    console.log('Accounts:', auth?.accounts);
    useEffect(() => {
        if (auth?.activeAccountId !== undefined) {
            setSelectedAccountId(auth.activeAccountId ?? null);
        }
    }, [auth?.activeAccountId]);

    const { primaryAccount, subAccounts, currentAccount } = useMemo(() => {
        if (!accounts.length) {
            return {
                primaryAccount: undefined,
                subAccounts: [] as MemberAccountSummary[],
                currentAccount: undefined,
            };
        }

        const main =
            accounts.find((account) => isAccountMain(account)) ?? accounts[0];
        const active =
            accounts.find((account) => account.id === selectedAccountId) ??
            accounts.find((account) => account.id === auth?.activeAccountId) ??
            main;

        return {
            primaryAccount: main,
            subAccounts: accounts.filter((account) => !isAccountMain(account)),
            currentAccount: active,
        };
    }, [accounts, selectedAccountId, auth?.activeAccountId]);

    if (!accounts.length || !currentAccount) {
        return null;
    }

    const handleSelect = (account: MemberAccountSummary) => {
        if (selectedAccountId === account.id) {
            return;
        }

        setSelectedAccountId(account.id);

        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('account', String(account.id));

            router.visit(`${url.pathname}${url.search}`, {
                preserveScroll: true,
                preserveState: false,
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex h-10 items-center gap-3 rounded-full border border-border/70 bg-background px-3 py-5 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <Avatar className="size-9 shadow-sm ring-1 ring-border/70">
                        <AvatarFallback
                            className={cn(
                                'bg-primary/10 font-medium text-primary',
                                isAccountMain(currentAccount)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-primary/10 text-primary',
                            )}
                        >
                            {getInitials(currentAccount.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col items-start text-left leading-tight">
                        <span className="truncate text-sm font-semibold text-foreground">
                            {currentAccount.name ?? 'Select account'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isAccountMain(currentAccount)
                                ? 'Primary account'
                                : 'Sub account'}
                        </span>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {formatPlan(currentAccount.package_type)}
                    </span>
                    <ChevronsUpDown className="size-4 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-72 rounded-xl border border-border/70 bg-background/95 p-2 shadow-lg backdrop-blur"
            >
                {primaryAccount && (
                    <>
                        <DropdownMenuLabel className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase">
                            Primary
                        </DropdownMenuLabel>
                        <AccountMenuItem
                            account={primaryAccount}
                            isActive={currentAccount.id === primaryAccount.id}
                            onSelect={handleSelect}
                        />
                    </>
                )}

                {subAccounts.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuLabel className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase">
                            Sub accounts
                        </DropdownMenuLabel>
                        {subAccounts.map((account) => (
                            <AccountMenuItem
                                key={account.id}
                                account={account}
                                isActive={currentAccount.id === account.id}
                                onSelect={handleSelect}
                            />
                        ))}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
