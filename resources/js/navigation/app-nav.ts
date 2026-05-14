import {
    CalendarDays,
    CalendarCheck,
    ChartColumn,
    CircleDollarSign,
    CreditCard,
    FileText,
    GraduationCap,
    History,
    LayoutGrid,
    Megaphone,
    ScrollText,
    ShieldCheck,
    ShieldPlus,
    UsersRound,
    Wifi,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as academicPeriodsIndex } from '@/routes/academic-periods';
import { index as announcementsIndex } from '@/routes/announcements';
import { index as auditLogsIndex } from '@/routes/audit-logs';
import { index as documentsIndex } from '@/routes/documents';
import { index as eventsIndex } from '@/routes/events';
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
import type { NavGroup, NavItem } from '@/types';

const dashboardNavItem: NavItem = {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
    permission: 'dashboard.view',
};

const studentsNavItem: NavItem = {
    title: 'Students',
    href: studentsIndex(),
    icon: GraduationCap,
    permission: 'students.view',
};

const executivesNavItem: NavItem = {
    title: 'Executives',
    href: executivesIndex(),
    icon: UsersRound,
    permission: 'executives.view',
};

const academicPeriodsNavItem: NavItem = {
    title: 'Academic Periods',
    href: academicPeriodsIndex(),
    icon: CalendarDays,
    permission: 'academic_periods.view',
};

const permitsNavItem: NavItem = {
    title: 'Permits',
    href: permitsIndex(),
    icon: CreditCard,
    permission: 'permits.view',
};

const nfcCardsNavItem: NavItem = {
    title: 'NFC Cards',
    href: nfcCardsIndex(),
    icon: Wifi,
    permission: 'nfc_cards.view',
};

const paymentsNavItem: NavItem = {
    title: 'Payments',
    href: paymentsIndex(),
    icon: CircleDollarSign,
    permission: 'payments.view',
};

const reportsNavItem: NavItem = {
    title: 'Reports',
    href: reportsIndex(),
    icon: ChartColumn,
    permission: 'reports.view',
};

const announcementsNavItem: NavItem = {
    title: 'Announcements',
    href: announcementsIndex(),
    icon: Megaphone,
    permission: 'announcements.view',
};

const eventsNavItem: NavItem = {
    title: 'Events',
    href: eventsIndex(),
    icon: CalendarCheck,
    permission: 'events.view',
};

const documentsNavItem: NavItem = {
    title: 'Documents',
    href: documentsIndex(),
    icon: FileText,
    permission: 'documents.view',
};

const rolesNavItem: NavItem = {
    title: 'Roles & Permissions',
    href: rolesIndex(),
    icon: ShieldPlus,
    permission: 'roles.view',
};

const verificationNavItem: NavItem = {
    title: 'Verification',
    href: verificationIndex(),
    icon: ShieldCheck,
    permission: 'verification.perform',
};

const verificationLogsNavItem: NavItem = {
    title: 'Verification Logs',
    href: verificationLogs(),
    icon: History,
    permission: 'verification.view_logs',
};

const auditLogsNavItem: NavItem = {
    title: 'Audit Logs',
    href: auditLogsIndex(),
    icon: ScrollText,
    permission: 'audit_logs.view',
};

export const mainNavItems: NavItem[] = [
    dashboardNavItem,
    studentsNavItem,
    executivesNavItem,
    academicPeriodsNavItem,
    permitsNavItem,
    nfcCardsNavItem,
    paymentsNavItem,
    announcementsNavItem,
    eventsNavItem,
    documentsNavItem,
    reportsNavItem,
    rolesNavItem,
    verificationNavItem,
    verificationLogsNavItem,
    auditLogsNavItem,
];

export const sidebarFooterNavItems: NavItem[] = [];

export const headerExternalNavItems: NavItem[] = [];

export const sidebarNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [dashboardNavItem, reportsNavItem],
    },
    {
        title: 'Records',
        items: [
            studentsNavItem,
            executivesNavItem,
            announcementsNavItem,
            eventsNavItem,
            documentsNavItem,
            academicPeriodsNavItem,
        ],
    },
    {
        title: 'Operations',
        items: [permitsNavItem, nfcCardsNavItem, paymentsNavItem],
    },
    {
        title: 'Verification',
        items: [verificationNavItem, verificationLogsNavItem],
    },
    {
        title: 'Administration',
        items: [rolesNavItem, auditLogsNavItem],
    },
];
