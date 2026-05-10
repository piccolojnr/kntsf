import {
    CalendarDays,
    CircleDollarSign,
    CreditCard,
    GraduationCap,
    History,
    LayoutGrid,
    ShieldCheck,
    Wifi,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as academicPeriodsIndex } from '@/routes/academic-periods';
import { index as nfcCardsIndex } from '@/routes/nfc-cards';
import { index as paymentsIndex } from '@/routes/payments';
import { index as permitsIndex } from '@/routes/permits';
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
];

export const sidebarFooterNavItems: NavItem[] = [];

export const headerExternalNavItems: NavItem[] = [];
