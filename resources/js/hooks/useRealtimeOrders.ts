import Echo from '@/lib/echo';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';

interface OrderStatusChangedEvent {
    order_id: number;
    trans_no: string;
    old_status: string;
    new_status: string;
    buyer_account_id: number;
    total_amount: number;
    payment_method: string | null;
    cashier_id: number;
    updated_at: string;
}

/**
 * Hook to listen for real-time order status changes
 * Automatically refreshes the page data when an order status changes
 * @param propsToReload - Array of prop names to reload (defaults to reloading all props)
 */
export function useRealtimeOrders(propsToReload?: string[]) {
    useEffect(() => {
        console.log('[useRealtimeOrders] Subscribing to orders channel...');

        // Listen to the orders channel
        const channel = Echo.channel('orders');

        channel.subscribed(() => {
            console.log(
                '[useRealtimeOrders] Successfully subscribed to orders channel',
            );
        });

        channel.error((error: any) => {
            console.error(
                '[useRealtimeOrders] Failed to subscribe to orders channel:',
                error,
            );
        });

        channel.listen(
            '.order.status.changed',
            (event: OrderStatusChangedEvent) => {
                console.log('[useRealtimeOrders] Order status changed:', event);

                // Reload the specified props or all props if none specified
                const reloadOptions: any = {
                    preserveScroll: true,
                    preserveState: true,
                };

                // If specific props are provided, only reload those
                if (propsToReload && propsToReload.length > 0) {
                    reloadOptions.only = propsToReload;
                }

                console.log(
                    '[useRealtimeOrders] Reloading page with options:',
                    reloadOptions,
                );

                router.reload(reloadOptions);
            },
        );

        // Cleanup on unmount
        return () => {
            console.log(
                '[useRealtimeOrders] Unsubscribing from orders channel',
            );
            Echo.leave('orders');
        };
    }, [propsToReload]);
}
