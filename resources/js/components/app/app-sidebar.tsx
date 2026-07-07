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
import { sidebarFooterNavItems, sidebarNavGroups } from '@/navigation/app-nav';
import { filterNavItemsForUser } from '@/navigation/filter-nav-items';
import { dashboard } from '@/routes';
import type { SharedPageProps } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<SharedPageProps>().props;
    const visibleNavGroups = sidebarNavGroups
        .map((group) => ({
            ...group,
            items: filterNavItemsForUser(group.items, auth),
        }))
        .filter((group) => group.items.length > 0);
    const visibleFooterNavItems = filterNavItemsForUser(
        sidebarFooterNavItems,
        auth,
    );

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="admin-rail border-sidebar-border/70 shadow-[16px_0_60px_rgba(18,13,28,0.18)]"
        >
            <SidebarHeader className="border-b border-sidebar-border/60 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-14 rounded-[1rem] px-3 text-sidebar-foreground transition duration-200 hover:bg-white/8 data-active:bg-white/8"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-4 px-1 py-4">
                <NavMain groups={visibleNavGroups} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 p-3">
                <NavFooter items={visibleFooterNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
