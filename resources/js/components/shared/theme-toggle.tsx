import { Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export function ThemeToggle({
    className,
    variant = 'default',
}: {
    className?: string;
    variant?: 'default' | 'glass';
}) {
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const nextAppearance =
        appearance === 'light'
            ? 'dark'
            : appearance === 'dark'
              ? 'system'
              : 'light';
    const Icon =
        appearance === 'system'
            ? Monitor
            : resolvedAppearance === 'dark'
              ? Moon
              : Sun;
    const label = `Theme: ${appearance}. Switch to ${nextAppearance}.`;

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={() => updateAppearance(nextAppearance)}
            className={cn(
                'grid size-10 place-items-center rounded-full border text-app-ink transition duration-200 hover:-translate-y-0.5 [&_svg]:size-4',
                variant === 'glass'
                    ? 'border-white/18 bg-white/10 text-white hover:bg-white/16'
                    : 'border-app-border bg-app-surface/80 shadow-[0_10px_28px_rgba(28,24,38,0.06)] hover:border-app-red/40 hover:text-app-red dark:bg-app-surface',
                className,
            )}
        >
            <Icon />
        </button>
    );
}
