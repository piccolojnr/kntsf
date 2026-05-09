import { CalendarDays, CreditCard, GraduationCap, LayoutGrid } from 'lucide-react';
import { dashboard } from '@/routes';
import { index as academicPeriodsIndex } from '@/routes/academic-periods';
import { index as permitsIndex } from '@/routes/permits';
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
    {
        title: 'Academic Periods',
        href: academicPeriodsIndex(),
        icon: CalendarDays,
        permission: 'academic_periods.view',
    },
    {
        title: 'Permits',
        href: permitsIndex(),
        icon: CreditCard,
        permission: 'permits.view',
    },
];

export const sidebarFooterNavItems: NavItem[] = [];

export const headerExternalNavItems: NavItem[] = [];
