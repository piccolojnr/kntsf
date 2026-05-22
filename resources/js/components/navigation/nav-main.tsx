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
                    <SidebarGroupLabel className="h-7 px-3 text-[0.62rem] font-black tracking-[0.22em] text-sidebar-foreground/45 uppercase">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarGroupContent
                        className={state === 'expanded' ? 'pl-2' : undefined}
                    >
                        <SidebarMenu className="gap-1.5">
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
                                                'h-10 rounded-md border border-transparent px-2.5 text-sidebar-foreground/72',
                                                'hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                                'data-active:border-sidebar-primary/45 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground',
                                                '[&_svg]:text-sidebar-foreground/52 data-active:[&_svg]:text-sidebar-primary',
                                            )}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>

                                        {hasChildren && (
                                            <SidebarMenuSub className="my-1 border-sidebar-border/60">
                                                {item.children?.map((child) => (
                                                    <SidebarMenuSubItem
                                                        key={child.title}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isCurrentUrl(
                                                                child.href,
                                                            )}
                                                            className="rounded-md text-sidebar-foreground/65 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
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
