import {
    CalendarDays,
    ChartColumn,
    CircleDollarSign,
    CreditCard,
    GraduationCap,
    History,
    LayoutGrid,
    ScrollText,
    ShieldCheck,
    ShieldPlus,
    UsersRound,
    Wifi,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as academicPeriodsIndex } from '@/routes/academic-periods';
import { index as auditLogsIndex } from '@/routes/audit-logs';
import { index as executivesIndex } from '@/routes/executives';
import { index as nfcCardsIndex } from '@/routes/nfc-cards';
import { index as paymentsIndex } from '@/routes/payments';
import { index as permitsIndex } from '@/routes/permits';
import { index as reportsIndex } from '@/routes/reports';
import { index as rolesIndex } from '@/routes/roles';
import { index as studentsIndex } from '@/routes/students';
import {
    index as verificationIndex,
    logs as verificationLogs,
} from '@/routes/verification';
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
        title: 'Executives',
        href: executivesIndex(),
        icon: UsersRound,
        permission: 'executives.view',
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
    {
        title: 'NFC Cards',
        href: nfcCardsIndex(),
        icon: Wifi,
        permission: 'nfc_cards.view',
    },
    {
        title: 'Payments',
        href: paymentsIndex(),
        icon: CircleDollarSign,
        permission: 'payments.view',
    },
    {
        title: 'Reports',
        href: reportsIndex(),
        icon: ChartColumn,
        permission: 'reports.view',
    },
    {
        title: 'Roles & Permissions',
        href: rolesIndex(),
        icon: ShieldPlus,
        permission: 'roles.view',
    },
    {
        title: 'Verification',
        href: verificationIndex(),
        icon: ShieldCheck,
        permission: 'verification.perform',
    },
    {
        title: 'Verification Logs',
        href: verificationLogs(),
        icon: History,
        permission: 'verification.view_logs',
    },
    {
        title: 'Audit Logs',
        href: auditLogsIndex(),
        icon: ScrollText,
        permission: 'audit_logs.view',
    },
];

export const sidebarFooterNavItems: NavItem[] = [];

export const headerExternalNavItems: NavItem[] = [];
