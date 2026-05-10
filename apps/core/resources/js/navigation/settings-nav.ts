import { CreditCard, Palette, Shield, User } from 'lucide-react';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editPermitSettings } from '@/routes/permit-settings';
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
];
