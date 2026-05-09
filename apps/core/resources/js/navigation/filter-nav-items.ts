import type { Auth, NavItem } from '@/types';

export function filterNavItemsForUser(items: NavItem[], auth: Auth): NavItem[] {
    void auth;

    return items;
}
