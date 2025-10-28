import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import React from 'react';

interface Shortcut {
    keys: string[];
    description: string;
}

const shortcuts: Shortcut[] = [
    { keys: ['Ctrl', 'K'], description: 'Focus search' },
    { keys: ['Ctrl', 'B'], description: 'Open cart' },
    { keys: ['Ctrl', 'Enter'], description: 'Submit order / Create order' },
    { keys: ['Esc'], description: 'Close dialogs' },
    { keys: ['Tab'], description: 'Navigate between order tabs' },
    { keys: ['1-6'], description: 'Switch to tab (Ordering, Pending, etc.)' },
    { keys: ['Ctrl', 'A'], description: 'Select all visible orders' },
    { keys: ['Barcode + Enter'], description: 'Scan product by barcode' },
];

export const KeyboardShortcutsHelp: React.FC = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Keyboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Shortcuts</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Speed up your workflow with these shortcuts
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                            <span className="text-sm text-slate-700">
                                {shortcut.description}
                            </span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, i) => (
                                    <React.Fragment key={i}>
                                        <kbd className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                                            {key}
                                        </kbd>
                                        {i < shortcut.keys.length - 1 && (
                                            <span className="px-1 text-slate-400">
                                                +
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
