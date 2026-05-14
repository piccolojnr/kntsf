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
        <section className={cn('rounded-lg border bg-card/70 p-4', className)}>
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-4">{children}</div>
        </section>
    );
}
