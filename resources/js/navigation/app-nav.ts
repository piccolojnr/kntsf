import { GraduationCap, LayoutGrid } from 'lucide-react';
import { dashboard } from '@/routes';
import { index as studentsIndex } from '@/routes/students';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Students',
        href: studentsIndex(),
        icon: GraduationCap,
        permission: 'students.view',
    },
];

export const sidebarFooterNavItems: NavItem[] = [];

export const headerExternalNavItems: NavItem[] = [];
