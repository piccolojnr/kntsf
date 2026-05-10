import { Head } from '@inertiajs/react';
import {
    Activity,
    BadgeCheck,
    ClipboardList,
    CreditCard,
    Users,
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

const quickActions = [
    {
        title: 'Review student records',
        description: 'Student operations will appear here once modules are added.',
        icon: Users,
    },
    {
        title: 'Manage permits',
        description: 'Permit workflows will connect here in a later feature pass.',
        icon: BadgeCheck,
    },
    {
        title: 'Check payments',
        description: 'Payment status shortcuts will be wired after payment setup.',
        icon: CreditCard,
    },
];

const overviewItems = [
    'Student account activity',
    'Permit issuance queue',
    'NFC verification status',
    'Payment reconciliation',
];

export default function Dashboard({
    recentActivity = [],
}: {
    recentActivity?: ActivityItem[];
}) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <section className="rounded-lg border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <div className="max-w-3xl space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Dashboard
                        </p>
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Welcome to the operations workspace
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            This shell is ready for students, permits, NFC,
                            payments, verification, and reporting modules as
                            they are built.
                        </p>
                    </div>
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
                            <CardTitle>Operational overview</CardTitle>
                            <CardDescription>
                                High-level queue and workload indicators will
                                be placed here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {overviewItems.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 rounded-md border p-3"
                                    >
                                        <ClipboardList className="size-4 text-muted-foreground" />
                                        <span className="text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
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
