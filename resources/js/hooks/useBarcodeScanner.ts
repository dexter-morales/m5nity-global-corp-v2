import { useEffect, useRef, useState } from 'react';

export function useBarcodeScanner(
    onBarcodeScanned: (barcode: string) => void,
    enabled = true,
) {
    const [buffer, setBuffer] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (event: KeyboardEvent) => {
            // Ignore if user is typing in an input field
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            // Enter key signals end of barcode scan
            if (event.key === 'Enter' && buffer.length > 0) {
                onBarcodeScanned(buffer);
                setBuffer('');
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                return;
            }

            // Accumulate characters
            if (event.key.length === 1) {
                setBuffer((prev) => prev + event.key);

                // Clear buffer after 100ms of inactivity (typical barcode scanners are faster)
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    setBuffer('');
                }, 100);
            }
        };

        document.addEventListener('keypress', handleKeyPress);
        return () => {
            document.removeEventListener('keypress', handleKeyPress);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [buffer, onBarcodeScanned, enabled]);

    return { buffer };
}
