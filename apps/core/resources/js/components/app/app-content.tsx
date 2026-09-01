import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type Props = React.ComponentProps<'main'>;

export function AppContent({ children, className, ...props }: Props) {
    return (
        <SidebarInset
            className={cn(
                'app-shell-surface overflow-x-hidden',
                'admin-page-reveal',
                className,
            )}
            {...props}
        >
            {children}
        </SidebarInset>
    );
}
