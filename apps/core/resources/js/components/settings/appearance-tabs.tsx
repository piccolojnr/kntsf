import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    compact = false,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    compact?: boolean;
}) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div
            className={cn(
                'inline-flex min-h-9 items-center gap-1 rounded-md border border-app-border bg-app-surface-muted p-1',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    title={label}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                        compact && 'h-7 w-7 justify-center px-0 py-0',
                        appearance === value
                            ? 'bg-app-surface text-app-ink shadow-xs'
                            : 'text-app-muted hover:bg-app-surface hover:text-app-ink',
                    )}
                >
                    <Icon className={cn('size-4', !compact && '-ml-1')} />
                    <span className={cn('ml-1.5 text-sm', compact && 'sr-only')}>
                        {label}
                    </span>
                </button>
            ))}
        </div>
    );
}
