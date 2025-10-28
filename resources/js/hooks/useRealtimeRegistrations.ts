import Echo from '@/lib/echo';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';

interface RegistrationReleasedEvent {
    pin_id: number;
    trans_no: string;
    status: string;
    member_id: number;
    updated_at: string;
}

/**
 * Hook to listen for real-time registration releases
 * Automatically refreshes the page data when a registration is released
 */
export function useRealtimeRegistrations() {
    useEffect(() => {
        // Listen to the registrations channel
        const channel = Echo.channel('registrations');

        channel.listen(
            '.registration.released',
            (event: RegistrationReleasedEvent) => {
                console.log('Registration released:', event);

                // Reload registration data
                router.reload({
                    only: [
                        'for_release_registrations',
                        'completed_registrations',
                    ],
                    preserveScroll: true,
                    preserveState: true,
                });
            },
        );

        // Cleanup on unmount
        return () => {
            Echo.leave('registrations');
        };
    }, []);
}
