import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function FormSection({
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
        <section className={cn('app-panel overflow-hidden p-5', className)}>
            <div className="mb-5">
                <h2 className="text-base font-semibold tracking-[-0.02em] text-app-ink">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm leading-6 text-app-muted">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-5">{children}</div>
        </section>
    );
}
