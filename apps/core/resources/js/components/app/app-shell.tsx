import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { SharedPageProps } from '@/types';

type Props = {
    children: ReactNode;
};

export function AppShell({ children }: Props) {
    const isOpen = usePage<SharedPageProps>().props.sidebarOpen;

    return (
        <SidebarProvider
            defaultOpen={isOpen}
            className="app-shell-surface admin-shell-grid has-data-[variant=inset]:bg-[#f8f7f3] dark:has-data-[variant=inset]:bg-app-page"
        >
            {children}
        </SidebarProvider>
    );
}
