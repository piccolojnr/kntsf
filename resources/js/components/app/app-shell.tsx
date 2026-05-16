import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant, SharedPageProps } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage<SharedPageProps>().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="app-shell-surface flex min-h-screen w-full flex-col">
                {children}
            </div>
        );
    }

    return (
        <SidebarProvider
            defaultOpen={isOpen}
            className="app-shell-surface has-data-[variant=inset]:bg-app-page"
        >
            {children}
        </SidebarProvider>
    );
}
