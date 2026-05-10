import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app/app-logo';
import { NavFooter } from '@/components/navigation/nav-footer';
import { NavMain } from '@/components/navigation/nav-main';
import { NavUser } from '@/components/navigation/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { mainNavItems, sidebarFooterNavItems } from '@/navigation/app-nav';
import { filterNavItemsForUser } from '@/navigation/filter-nav-items';
import { dashboard } from '@/routes';
import type { SharedPageProps } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<SharedPageProps>().props;
    const visibleMainNavItems = filterNavItemsForUser(mainNavItems, auth);
    const visibleFooterNavItems = filterNavItemsForUser(
        sidebarFooterNavItems,
        auth,
    );

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-sidebar-border/70"
        >
            <SidebarHeader className="border-b border-sidebar-border/60 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-14 rounded-xl px-3"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-3 px-1 py-3">
                <NavMain items={visibleMainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 p-3">
                <NavFooter items={visibleFooterNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
