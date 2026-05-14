import { Head } from '@inertiajs/react';
import {
    Activity,
    ClipboardList,
    CreditCard,
    IdCard,
    Newspaper,
    ShieldAlert,
    ShieldCheck,
    Users,
    Wifi,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ActivityItem } from '@/features/audit-logs/types';
import { dashboard } from '@/routes';

type DashboardSummary = {
    total_students: number;
    activated_student_accounts: number;
    pending_setup_student_accounts: number;
    active_permits: number;
    expired_permits: number;
    revoked_permits: number;
    active_nfc_cards: number;
    pending_payments: number;
    successful_payments: number;
    verification_attempts_today: number;
    failed_verification_attempts_today: number;
};

type DashboardWarning = {
    key: string;
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low' | string;
    count?: number;
};

type ContentReadinessItem = {
    key: string;
    title: string;
    description: string;
    ready: boolean;
};

const quickActions = [
    {
        title: 'Review student records',
        description: 'Find profiles, update details, and activate accounts.',
        icon: Users,
    },
    {
        title: 'Manage permits',
        description: 'Issue permits, mark cards delivered, and revoke when needed.',
        icon: IdCard,
    },
    {
        title: 'Check payments',
        description: 'Confirm manual payments and review linked permits.',
        icon: CreditCard,
    },
];

export default function Dashboard({
    summary,
    warnings = [],
    contentReadiness = [],
    recentActivity = [],
}: {
    summary: DashboardSummary;
    warnings?: DashboardWarning[];
    contentReadiness?: ContentReadinessItem[];
    recentActivity?: ActivityItem[];
}) {
    const summaryCards = [
        {
            title: 'Students',
            value: summary.total_students,
            detail: `${summary.activated_student_accounts} activated, ${summary.pending_setup_student_accounts} pending setup`,
            icon: Users,
        },
        {
            title: 'Active permits',
            value: summary.active_permits,
            detail: `${summary.expired_permits} expired, ${summary.revoked_permits} revoked`,
            icon: IdCard,
        },
        {
            title: 'NFC cards',
            value: summary.active_nfc_cards,
            detail: 'Active cards assigned to students',
            icon: Wifi,
        },
        {
            title: 'Payments',
            value: summary.successful_payments,
            detail: `${summary.pending_payments} pending payments`,
            icon: CreditCard,
        },
        {
            title: 'Verification today',
            value: summary.verification_attempts_today,
            detail: `${summary.failed_verification_attempts_today} failed attempts`,
            icon: ShieldCheck,
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <section className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Dashboard
                            </p>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                Operations overview
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Monitor students, permits, NFC cards, payments,
                                verification attempts, and recent audited
                                activity.
                            </p>
                        </div>
                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                            {warnings.length} operational warning
                            {warnings.length === 1 ? '' : 's'}
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {summaryCards.map((item) => (
                        <Card key={item.title} className="gap-3">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                                <CardTitle className="text-sm font-medium">
                                    {item.title}
                                </CardTitle>
                                <item.icon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.detail}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {quickActions.map((item) => (
                        <Card key={item.title}>
                            <CardHeader className="space-y-3">
                                <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                                    <item.icon className="size-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">
                                        {item.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {item.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Operational warnings</CardTitle>
                            <CardDescription>
                                Items that may need administrative attention.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {warnings.length === 0 ? (
                                <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                                    No operational warnings right now.
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {warnings.map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex items-start gap-3 rounded-md border p-3"
                                        >
                                            <ShieldAlert className="mt-0.5 size-4 text-muted-foreground" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {item.title}
                                                    </span>
                                                    {item.count !== undefined && (
                                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                                            {item.count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        key="summary"
                                        className="flex items-center gap-3 rounded-md border p-3"
                                    >
                                        <ClipboardList className="size-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Review reports for grouped counts.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent activity</CardTitle>
                            <CardDescription>
                                Latest audited operational events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length === 0 ? (
                                <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed text-center">
                                    <Activity className="mb-3 size-5 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No activity yet
                                    </p>
                                    <p className="mt-1 max-w-48 text-xs text-muted-foreground">
                                        Audited system events will be summarized
                                        in this panel.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivity.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-md border p-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {item.description ??
                                                            'System activity'}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatActivityDate(
                                                        item.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {item.actor?.name ?? 'System'}
                                                {item.subject
                                                    ? ` -> ${item.subject.label}`
                                                    : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {contentReadiness.length > 0 && (
                    <section>
                        <Card>
                            <CardHeader>
                                <CardTitle>Content readiness</CardTitle>
                                <CardDescription>
                                    Publishing infrastructure is prepared before
                                    news, events, and document modules are
                                    added.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-3">
                                {contentReadiness.map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-start gap-3 rounded-md border p-3"
                                    >
                                        <Newspaper className="mt-0.5 size-4 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">
                                                    {item.title}
                                                </p>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                                    {item.ready
                                                        ? 'Ready'
                                                        : 'Internal'}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                )}
            </div>
        </>
    );
}

function formatActivityDate(value: string | null) {
    return value === null ? 'Now' : new Date(value).toLocaleDateString();
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
