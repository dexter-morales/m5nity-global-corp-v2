import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export type ServerSortDirection = 'asc' | 'desc';

interface ServerTableFilters {
    search?: string;
    sort?: string;
    direction?: ServerSortDirection;
}

interface UseServerTableOptions {
    route: string;
    filters?: ServerTableFilters;
    defaultSort?: string;
    defaultDirection?: ServerSortDirection;
    debounceMs?: number;
    query?: Record<string, unknown>;
}

export function useServerTableControls({
    route,
    filters = {},
    defaultSort = 'created_at',
    defaultDirection = 'desc',
    debounceMs = 300,
    query = {},
}: UseServerTableOptions) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    useEffect(() => {
        setSearchTerm(filters.search ?? '');
    }, [filters.search]);

    const currentSort = filters.sort ?? defaultSort;
    const currentDirection: ServerSortDirection =
        (filters.direction as ServerSortDirection | undefined) ?? defaultDirection;

    useEffect(() => {
        const timeout = setTimeout(() => {
            if ((filters.search ?? '') === searchTerm) return;

            router.get(
                route,
                {
                    ...query,
                    search: searchTerm || undefined,
                    sort: currentSort,
                    direction: currentDirection,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, debounceMs);

        return () => clearTimeout(timeout);
    }, [searchTerm, currentSort, currentDirection, filters.search, route, debounceMs, query]);

    const toggleSort = (field: string) => {
        const nextDirection: ServerSortDirection =
            currentSort === field && currentDirection === 'asc' ? 'desc' : 'asc';

        router.get(
            route,
            {
                ...query,
                search: searchTerm || undefined,
                sort: field,
                direction: nextDirection,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const sortIndicator = (field: string) => {
        if (currentSort !== field) return '';
        return currentDirection === 'asc' ? String.fromCharCode(0x25B2) : String.fromCharCode(0x25BC);
    };

    return {
        searchTerm,
        setSearchTerm,
        currentSort,
        currentDirection,
        toggleSort,
        sortIndicator,
    };
}
