import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ContentPage({ children }: { children: ReactNode }) {
    return (
        <main className="app-page flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
            {children}
        </main>
    );
}

export function ContentToolbar({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function OverviewTile({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon?: ComponentType<{ className?: string }>;
}) {
    return (
        <article className="app-panel group overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-app-muted uppercase">
                    {label}
                </p>
                {Icon && (
                    <span className="theme-ink-soft grid size-9 place-items-center rounded-full text-app-red">
                        <Icon className="size-4" />
                    </span>
                )}
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-app-ink tabular-nums">
                {value}
            </p>
        </article>
    );
}

export function RegistryPanel({
    title,
    description,
    filters,
    children,
}: {
    title: string;
    description: string;
    filters?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="app-panel overflow-hidden">
            <header className="flex flex-col gap-4 border-b border-app-border p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-app-red uppercase">
                        Registry
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-app-ink">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-app-muted">
                        {description}
                    </p>
                </div>
                {filters && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                        {filters}
                    </div>
                )}
            </header>
            <div className="p-3 sm:p-4">{children}</div>
        </section>
    );
}

export function DetailPanel({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('app-panel overflow-hidden', className)}>
            <header className="border-b border-app-border p-5">
                <h2 className="text-xl font-semibold tracking-[-0.025em] text-app-ink">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm leading-6 text-app-muted">
                        {description}
                    </p>
                )}
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

export function DetailItem({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('app-panel-muted p-3', className)}>
            <p className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                {label}
            </p>
            <div className="mt-1 text-sm font-medium text-app-ink">
                {children}
            </div>
        </div>
    );
}

export function EmptyContentState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="grid min-h-52 place-items-center rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted/70 p-8 text-center">
            <div>
                <p className="font-semibold text-app-ink">{title}</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-app-muted">
                    {description}
                </p>
            </div>
        </div>
    );
}
