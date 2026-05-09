import { edit as editAppearance } from '@/routes/appearance';
import { edit as editPermitSettings } from '@/routes/permit-settings';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

export const settingsNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
        permission: 'settings.view',
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
        permission: 'settings.view',
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
        permission: 'settings.view',
    },
    {
        title: 'Permit settings',
        href: editPermitSettings(),
        icon: null,
        permission: 'permit_settings.view',
    },
];
