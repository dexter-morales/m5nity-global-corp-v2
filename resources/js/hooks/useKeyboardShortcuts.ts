import { useEffect } from 'react';

export type KeyboardShortcut = {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description?: string;
};

export function useKeyboardShortcuts(
    shortcuts: KeyboardShortcut[],
    enabled = true,
) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const keyMatches =
                    event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatches = shortcut.ctrl
                    ? event.ctrlKey || event.metaKey
                    : !event.ctrlKey && !event.metaKey;
                const shiftMatches = shortcut.shift
                    ? event.shiftKey
                    : !event.shiftKey;
                const altMatches = shortcut.alt ? event.altKey : !event.altKey;

                if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
}
