import '../css/app.css';

import { createInertiaApp, router as inertiaRouter } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import ToastProvider from './components/toast-provider';
import { notifyError, notifySuccess } from './lib/notifier';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <>
                    <App {...props} />
                    <ToastProvider />
                </>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Show flash messages from server as toasts after successful navigations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
inertiaRouter.on('success', (event: any) => {
    const page = event?.detail?.page;
    const flash = page?.props?.flash ?? {};
    if (flash?.success) notifySuccess(String(flash.success));
    if (flash?.error) notifyError(String(flash.error));
});
