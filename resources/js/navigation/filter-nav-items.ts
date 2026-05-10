import type { Auth, NavItem } from '@/types';

export function filterNavItemsForUser(items: NavItem[], auth: Auth): NavItem[] {
    const user = auth.user;

    if (!user) {
        return [];
    }

    return items.reduce<NavItem[]>((visibleItems, item) => {
        const children = item.children
            ? filterNavItemsForUser(item.children, auth)
            : undefined;

        if (!canViewNavItem(item, user.permissions, user.roles, children)) {
            return visibleItems;
        }

        visibleItems.push({
            ...item,
            children,
        });

        return visibleItems;
    }, []);
}

function canViewNavItem(
    item: NavItem,
    permissions: string[],
    roles: string[],
    children?: NavItem[],
): boolean {
    const hasVisibleChildren = children !== undefined && children.length > 0;
    const hasRequiredPermission =
        item.permission === undefined ||
        item.permission === null ||
        permissions.includes(item.permission);
    const hasRequiredRole =
        item.roles === undefined ||
        item.roles.length === 0 ||
        item.roles.some((role) => roles.includes(role));

    return (hasRequiredPermission && hasRequiredRole) || hasVisibleChildren;
}
