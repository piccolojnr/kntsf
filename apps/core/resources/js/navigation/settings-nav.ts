import {
    CreditCard,
    Newspaper,
    Palette,
    ServerCog,
    Shield,
    User,
} from 'lucide-react';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editContentSettings } from '@/routes/content-settings';
import { edit as editPermitSettings } from '@/routes/permit-settings';
import { edit as editPlatformSettings } from '@/routes/platform-settings';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

export const settingsNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
        permission: 'settings.view',
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: Shield,
        permission: 'settings.view',
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
        permission: 'settings.view',
    },
    {
        title: 'Permit settings',
        href: editPermitSettings(),
        icon: CreditCard,
        permission: 'permit_settings.view',
    },
    {
        title: 'Content settings',
        href: editContentSettings(),
        icon: Newspaper,
        permission: 'content_settings.view',
    },
    {
        title: 'Platform settings',
        href: editPlatformSettings(),
        icon: ServerCog,
        permission: 'settings.view',
    },
];
