// Lightweight notifier wrapper. If react-toastify is available, use it.
// Otherwise, fall back to console and alert.

type ToastFn = (msg: string) => void;

let toastSuccess: ToastFn | null = null;
let toastError: ToastFn | null = null;

// Attempt to dynamically import react-toastify at runtime.
// If not installed, this will fail silently and we will use fallbacks.
import('react-toastify')
    .then((mod) => {
        const toast = mod.toast as unknown as {
            success: ToastFn;
            error: ToastFn;
        };
        toastSuccess = toast.success.bind(toast);
        toastError = toast.error.bind(toast);
    })
    .catch(() => {
        // No-op; fallbacks will be used
    });

export function notifySuccess(message: string) {
    if (toastSuccess) return toastSuccess(message);
    try {
        // eslint-disable-next-line no-alert
        alert(message);
    } catch (_) {
        // eslint-disable-next-line no-console
        console.log('[success]', message);
    }
}

export function notifyError(message: string) {
    if (toastError) return toastError(message);
    try {
        // eslint-disable-next-line no-alert
        alert(message);
    } catch (_) {
        // eslint-disable-next-line no-console
        console.error('[error]', message);
    }
}

