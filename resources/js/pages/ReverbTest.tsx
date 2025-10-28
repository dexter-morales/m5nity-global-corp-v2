import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import Echo from '@/lib/echo';
import { router, usePage } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    FileText,
    Radio,
    RefreshCw,
    Send,
    XCircle,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReverbTestProps {
    broadcastConnection: string;
    reverbConfig: {
        app_key: string;
        host: string;
        port: number;
        scheme: string;
    };
    recentOrders: Array<{
        id: number;
        trans_no: string;
        status: string;
    }>;
}

interface TestEvent {
    message: string;
    test_data: {
        test_id: string;
        random_number: number;
        server_time: string;
    };
    timestamp: string;
}

interface OrderEvent {
    order_id: number;
    trans_no: string;
    old_status: string;
    new_status: string;
}

interface LogEntry {
    timestamp: string;
    type: 'connection' | 'event' | 'error' | 'subscription';
    message: string;
    data?: any;
}

export default function ReverbTest() {
    const { broadcastConnection, reverbConfig, recentOrders } = usePage<{
        props: ReverbTestProps;
    }>().props;

    const [connected, setConnected] = useState(false);
    const [testEvents, setTestEvents] = useState<TestEvent[]>([]);
    const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [connectionDetails, setConnectionDetails] = useState<any>(null);

    const addLog = (type: LogEntry['type'], message: string, data?: any) => {
        const newLog: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            type,
            message,
            data,
        };
        setLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
        console.log(`[Reverb ${type.toUpperCase()}]`, message, data || '');
    };

    useEffect(() => {
        if (!window.Echo) {
            addLog('error', 'Echo not initialized!');
            return;
        }

        addLog('connection', 'Attempting to connect to Reverb...', {
            host: reverbConfig.host,
            port: reverbConfig.port,
            scheme: reverbConfig.scheme,
        });

        // Check connection status
        const checkConnection = () => {
            const echoConnector = (window.Echo as any).connector;
            if (echoConnector && echoConnector.pusher) {
                const pusher = echoConnector.pusher;
                setConnectionDetails({
                    state: pusher.connection.state,
                    socket_id: pusher.connection.socket_id,
                    host: `${reverbConfig.scheme}://${reverbConfig.host}:${reverbConfig.port}`,
                });

                if (pusher.connection.state === 'connected') {
                    setConnected(true);
                    addLog('connection', 'Connected to Reverb successfully!', {
                        socket_id: pusher.connection.socket_id,
                    });
                }
            }
        };

        const interval = setInterval(checkConnection, 1000);
        checkConnection();

        // Subscribe to test channel
        const testChannel = Echo.channel('reverb-test');

        testChannel.subscribed(() => {
            addLog('subscription', 'Subscribed to reverb-test channel');
        });

        testChannel.error((error: any) => {
            addLog(
                'error',
                'Failed to subscribe to reverb-test channel',
                error,
            );
        });

        testChannel.listen('.reverb.test', (event: TestEvent) => {
            addLog('event', 'Received reverb.test event', event);
            setTestEvents((prev) => [event, ...prev].slice(0, 20));
        });

        // Subscribe to orders channel
        const ordersChannel = Echo.channel('orders');

        ordersChannel.subscribed(() => {
            addLog('subscription', 'Subscribed to orders channel');
        });

        ordersChannel.error((error: any) => {
            addLog('error', 'Failed to subscribe to orders channel', error);
        });

        ordersChannel.listen('.order.status.changed', (event: OrderEvent) => {
            addLog('event', 'Received order.status.changed event', event);
            setOrderEvents((prev) => [event, ...prev].slice(0, 20));
        });

        return () => {
            clearInterval(interval);
            Echo.leave('reverb-test');
            Echo.leave('orders');
            addLog('connection', 'Disconnected from Reverb channels');
        };
    }, []);

    const triggerTestEvent = () => {
        addLog('event', 'Triggering manual test event...');
        router.post(
            '/reverb-test/trigger',
            {
                message: `Test Event at ${new Date().toLocaleTimeString()}`,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    addLog('event', 'Test event triggered successfully'),
                onError: () => addLog('error', 'Failed to trigger test event'),
            },
        );
    };

    const triggerOrderEvent = (orderId: number) => {
        addLog('event', `Triggering order event for order ${orderId}...`);
        router.post(
            `/reverb-test/trigger-order/${orderId}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    addLog('event', 'Order event triggered successfully'),
                onError: () => addLog('error', 'Failed to trigger order event'),
            },
        );
    };

    const clearLogs = () => {
        setLogs([]);
        setTestEvents([]);
        setOrderEvents([]);
        addLog('connection', 'Logs cleared');
    };

    return (
        <AppLayout>
            <div className="container mx-auto space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Laravel Reverb Test Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Real-time broadcasting test & monitoring
                        </p>
                    </div>
                    <Button onClick={clearLogs} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Clear Logs
                    </Button>
                </div>

                {/* Connection Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {connected ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            Connection Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Broadcaster
                                </p>
                                <Badge
                                    variant={
                                        broadcastConnection === 'reverb'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {broadcastConnection}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Status
                                </p>
                                <Badge
                                    variant={
                                        connected ? 'default' : 'destructive'
                                    }
                                >
                                    {connectionDetails?.state || 'Disconnected'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Socket ID
                                </p>
                                <p className="font-mono text-sm">
                                    {connectionDetails?.socket_id || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Host
                                </p>
                                <p className="font-mono text-sm">
                                    {reverbConfig.scheme}://{reverbConfig.host}:
                                    {reverbConfig.port}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Controls */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Test Event
                            </CardTitle>
                            <CardDescription>
                                Trigger a test broadcast event
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={triggerTestEvent}
                                disabled={!connected}
                                className="w-full"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Trigger Test Event
                            </Button>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">
                                    Recent Test Events ({testEvents.length})
                                </p>
                                <div className="max-h-48 space-y-2 overflow-y-auto">
                                    {testEvents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No events received yet
                                        </p>
                                    ) : (
                                        testEvents.map((event, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded bg-secondary p-2 text-xs"
                                            >
                                                <p className="font-semibold">
                                                    {event.message}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Test ID:{' '}
                                                    {event.test_data.test_id} |
                                                    Random:{' '}
                                                    {
                                                        event.test_data
                                                            .random_number
                                                    }
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {event.timestamp}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Order Events
                            </CardTitle>
                            <CardDescription>
                                Trigger real order status change events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 space-y-2">
                                <p className="text-sm font-semibold">
                                    Recent Orders
                                </p>
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No orders available
                                    </p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <Button
                                            key={order.id}
                                            onClick={() =>
                                                triggerOrderEvent(order.id)
                                            }
                                            disabled={!connected}
                                            variant="outline"
                                            className="w-full justify-start text-xs"
                                        >
                                            <Radio className="mr-2 h-3 w-3" />
                                            {order.trans_no} - {order.status}
                                        </Button>
                                    ))
                                )}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">
                                    Received Order Events ({orderEvents.length})
                                </p>
                                <div className="max-h-48 space-y-2 overflow-y-auto">
                                    {orderEvents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No events received yet
                                        </p>
                                    ) : (
                                        orderEvents.map((event, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded bg-secondary p-2 text-xs"
                                            >
                                                <p className="font-semibold">
                                                    Order #{event.order_id}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {event.trans_no}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {event.old_status} →{' '}
                                                    {event.new_status}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Event Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Event Logs
                        </CardTitle>
                        <CardDescription>
                            Real-time connection and event logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 space-y-1 overflow-y-auto font-mono text-xs">
                            {logs.length === 0 ? (
                                <p className="text-muted-foreground">
                                    No logs yet
                                </p>
                            ) : (
                                logs.map((log, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded p-2 ${
                                            log.type === 'error'
                                                ? 'bg-red-100 dark:bg-red-900/20'
                                                : log.type === 'event'
                                                  ? 'bg-green-100 dark:bg-green-900/20'
                                                  : log.type === 'subscription'
                                                    ? 'bg-blue-100 dark:bg-blue-900/20'
                                                    : 'bg-secondary'
                                        }`}
                                    >
                                        <span className="text-muted-foreground">
                                            [{log.timestamp}]
                                        </span>
                                        <span className="ml-2 font-semibold uppercase">
                                            [{log.type}]
                                        </span>
                                        <span className="ml-2">
                                            {log.message}
                                        </span>
                                        {log.data && (
                                            <pre className="mt-1 overflow-x-auto text-xs">
                                                {JSON.stringify(
                                                    log.data,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
