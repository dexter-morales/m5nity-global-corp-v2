// Notifier wrapper using Sonner (ShadCN toast)
import { toast } from 'sonner';

export function notifySuccess(message: string) {
    toast.success(message, {
        duration: 3000,
    });
}

export function notifyError(message: string) {
    toast.error(message, {
        duration: 4000,
    });
}

export function notifyInfo(message: string) {
    toast.info(message, {
        duration: 3000,
    });
}

export function notifyWarning(message: string) {
    toast.warning(message, {
        duration: 3000,
    });
}

export function notifyLoading(message: string) {
    return toast.loading(message);
}

export function dismissToast(toastId: string | number) {
    toast.dismiss(toastId);
}

// Export toast for custom usage
export { toast };
