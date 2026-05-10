import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavGroup, NavItem } from '@/types';

type NavMainProps = {
    groups?: NavGroup[];
    items?: NavItem[];
};

export function NavMain({ groups, items = [] }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();
    const { state } = useSidebar();
    const navGroups =
        groups ??
        (items.length > 0
            ? [
                  {
                      title: 'Workspace',
                      items,
                  },
              ]
            : []);

    return (
        <>
            {navGroups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel className="px-3 text-[0.68rem] font-semibold tracking-wide text-muted-foreground uppercase">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarGroupContent
                        className={state === 'expanded' ? 'pl-4' : undefined}
                    >
                        <SidebarMenu className="gap-1">
                            {group.items.map((item) => {
                                const hasChildren =
                                    item.children !== undefined &&
                                    item.children.length > 0;
                                const isActive =
                                    isCurrentUrl(item.href) ||
                                    item.children?.some((child) =>
                                        isCurrentUrl(child.href),
                                    ) === true;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={{ children: item.title }}
                                            className={cn(
                                                'h-9 rounded-lg px-2.5 text-sidebar-foreground/80',
                                                'data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:shadow-xs',
                                                '[&_svg]:text-sidebar-foreground/60 data-active:[&_svg]:text-sidebar-accent-foreground',
                                            )}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>

                                        {hasChildren && (
                                            <SidebarMenuSub>
                                                {item.children?.map((child) => (
                                                    <SidebarMenuSubItem
                                                        key={child.title}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isCurrentUrl(
                                                                child.href,
                                                            )}
                                                        >
                                                            <Link
                                                                href={
                                                                    child.href
                                                                }
                                                                prefetch
                                                            >
                                                                <span>
                                                                    {
                                                                        child.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
