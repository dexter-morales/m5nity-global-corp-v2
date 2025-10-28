import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return normalizeUrl(resolveUrl(url1)) === normalizeUrl(resolveUrl(url2));
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

function normalizeUrl(url: string): string {
    try {
        const parsed = new URL(url, 'http://localhost');
        const normalizedPath = stripTrailingSlash(parsed.pathname);
        return normalizedPath.startsWith('/')
            ? normalizedPath
            : `/${normalizedPath}`;
    } catch {
        const rawPath = stripTrailingSlash(url.split('#')[0].split('?')[0]);
        if (!rawPath) {
            return '/';
        }
        return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    }
}

function stripTrailingSlash(path: string): string {
    return path.replace(/\/+$/, '') || (path.startsWith('/') ? '/' : path);
}
