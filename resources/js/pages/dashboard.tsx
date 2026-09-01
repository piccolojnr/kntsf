import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    CircleDollarSign,
    IdCard,
    Newspaper,
    ShieldCheck,
    Users,
    Wifi,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ReportScopeFilter } from '@/components/shared/report-scope-filter';
import type {
    ReportFilterOptions,
    ReportFilters,
} from '@/components/shared/report-scope-filter';
import type { ActivityItem } from '@/features/audit-logs/types';
import { dashboard } from '@/routes';
import { index as nfcCardsIndex } from '@/routes/nfc-cards';
import { index as paymentsIndex } from '@/routes/payments';
import { index as permitRequestsIndex } from '@/routes/permit-requests';
import { index as permitsIndex } from '@/routes/permits';
import { index as reportsIndex } from '@/routes/reports';
import { index as studentsIndex } from '@/routes/students';
import type { RouteDefinition } from '@/wayfinder';

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
    stuck_permit_requests?: number;
    paid_unissued_permit_requests?: number;
    verification_attempts_today: number;
    failed_verification_attempts_today: number;
    verification_attempts: number;
    failed_verification_attempts: number;
    active_elections: number;
    pending_candidates: number;
    election_votes_today: number;
    election_votes: number;
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

type ReportGroups = Record<string, Record<string, number>>;

const chartColors = ['#18231d', '#b45309', '#0f766e', '#b91c1c', '#7c3aed'];

export default function Dashboard({
    filters,
    filterOptions,
    summary,
    reports = {},
    warnings = [],
    contentReadiness = [],
    recentActivity = [],
}: {
    filters: ReportFilters;
    filterOptions: ReportFilterOptions;
    summary: DashboardSummary;
    reports?: ReportGroups;
    warnings?: DashboardWarning[];
    contentReadiness?: ContentReadinessItem[];
    recentActivity?: ActivityItem[];
}) {
    const activationRate = percent(
        summary.activated_student_accounts,
        summary.total_students,
    );
    const permitTotal =
        summary.active_permits +
        summary.expired_permits +
        summary.revoked_permits;
    const successfulVerification = Math.max(
        summary.verification_attempts - summary.failed_verification_attempts,
        0,
    );
    const verificationRate = percent(
        successfulVerification,
        summary.verification_attempts,
    );
    const reportQuery = filterQuery(filters);
    const overviewData = Object.entries(reports).map(
        ([key, values], index) => ({
            key,
            label: titleCase(key),
            total: Object.values(values).reduce(
                (total, value) => total + value,
                0,
            ),
            fill: chartColors[index % chartColors.length],
        }),
    );

    const metrics = [
        {
            label: 'Students',
            value: summary.total_students,
            detail: `${activationRate}% accounts activated`,
            icon: Users,
            href: studentsIndex(),
            accent: 'bg-[#e8f0e9] text-[#0f766e]',
            meter: activationRate,
        },
        {
            label: 'Active permits',
            value: summary.active_permits,
            detail: `${summary.expired_permits} expired · ${summary.revoked_permits} revoked`,
            icon: IdCard,
            href: permitsIndex(),
            accent: 'bg-[#fff1d6] text-[#b45309]',
            meter: percent(summary.active_permits, permitTotal),
        },
        {
            label: 'NFC cards',
            value: summary.active_nfc_cards,
            detail: 'Active cards assigned',
            icon: Wifi,
            href: nfcCardsIndex(),
            accent: 'bg-[#e7eef4] text-[#155e75]',
            meter: percent(summary.active_nfc_cards, summary.total_students),
        },
        {
            label: 'Payments confirmed',
            value: summary.successful_payments,
            detail: `${summary.pending_payments} still pending`,
            icon: CircleDollarSign,
            href: paymentsIndex(),
            accent: 'bg-[#f7e8e6] text-[#b91c1c]',
            meter: percent(
                summary.successful_payments,
                summary.successful_payments + summary.pending_payments,
            ),
        },
    ] as const;

    const queue = [
        {
            label: 'Stuck requests',
            value: summary.stuck_permit_requests ?? 0,
            href: permitRequestsIndex(),
        },
        {
            label: 'Paid, not issued',
            value: summary.paid_unissued_permit_requests ?? 0,
            href: permitRequestsIndex(),
        },
        {
            label: 'Failed checks today',
            value: summary.failed_verification_attempts_today,
            href: permitRequestsIndex(),
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <main className="app-page w-full max-w-full overflow-x-hidden px-4 pb-12 md:px-7 lg:px-9">
                <header className="flex flex-col gap-5 border-b border-app-border py-7 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-app-muted uppercase">
                            Student administration
                        </p>
                        <h1 className="dashboard-display mt-2 text-4xl font-semibold tracking-[-0.055em] text-app-ink md:text-5xl">
                            Dashboard overview
                        </h1>
                        <p className="mt-2 text-sm text-app-muted">
                            {filters.label} · Updated just now
                        </p>
                    </div>
                    <Link
                        href={reportsIndex({ query: reportQuery })}
                        className="inline-flex items-center gap-2 self-start rounded-lg border border-app-border px-4 py-2.5 text-sm font-semibold text-app-ink transition hover:border-app-ink hover:bg-app-surface-muted md:self-auto"
                    >
                        <BarChart3 className="size-4" />
                        Reports
                    </Link>
                </header>

                <div className="py-5">
                    <ReportScopeFilter
                        filters={filters}
                        filterOptions={filterOptions}
                        routeUrl={dashboard.url()}
                    />
                </div>

                <section className="grid grid-flow-dense gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <MetricCard key={metric.label} {...metric} />
                    ))}
                </section>

                <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
                    <Panel title="Operations" icon={BarChart3}>
                        <div className="h-72 w-full">
                            {overviewData.length === 0 ? (
                                <EmptyState
                                    icon={BarChart3}
                                    title="No operations to chart"
                                    description="Report totals will appear here once records are available."
                                />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={overviewData}
                                        margin={{
                                            top: 12,
                                            right: 8,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            stroke="var(--app-border)"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: 'var(--app-muted)',
                                                fontSize: 11,
                                            }}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: 'var(--app-muted)',
                                                fontSize: 11,
                                            }}
                                        />
                                        <Tooltip
                                            cursor={{
                                                fill: 'var(--app-surface-muted)',
                                            }}
                                            contentStyle={{
                                                borderRadius: 10,
                                                border: '1px solid var(--app-border)',
                                                background:
                                                    'var(--app-surface)',
                                                color: 'var(--app-ink)',
                                            }}
                                        />
                                        <Bar
                                            dataKey="total"
                                            radius={[5, 5, 0, 0]}
                                        >
                                            {overviewData.map((item) => (
                                                <Cell
                                                    key={item.key}
                                                    fill={item.fill}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Panel>

                    <Panel title="Verification" icon={ShieldCheck}>
                        <div className="relative h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    startAngle={90}
                                    endAngle={-270}
                                    data={[
                                        {
                                            name: 'Success',
                                            value: verificationRate,
                                            fill: '#0f766e',
                                        },
                                    ]}
                                >
                                    <PolarAngleAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tick={false}
                                    />
                                    <RadialBar
                                        dataKey="value"
                                        background={{
                                            fill: 'var(--app-surface-muted)',
                                        }}
                                        cornerRadius={8}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                                <div>
                                    <p className="dashboard-display text-4xl font-semibold tracking-[-0.06em] text-app-ink">
                                        {verificationRate}%
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-app-muted">
                                        successful checks
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-app-border pt-3 text-sm">
                            <span className="text-app-muted">
                                {summary.verification_attempts} attempts
                            </span>
                            <span className="font-semibold text-app-red">
                                {summary.failed_verification_attempts} failed
                            </span>
                        </div>
                    </Panel>
                </section>

                <section className="mt-8 grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                    <Panel title="Needs attention" icon={AlertTriangle}>
                        <div className="grid grid-flow-dense gap-2 md:grid-cols-3">
                            {queue.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="group flex items-center justify-between gap-3 rounded-lg border border-app-border p-3 transition hover:border-app-red/45 hover:bg-app-surface-muted"
                                >
                                    <span className="text-sm font-semibold text-app-ink">
                                        {item.label}
                                    </span>
                                    <span
                                        className={`flex items-center gap-2 text-lg font-bold tabular-nums ${item.value > 0 ? 'text-app-red' : 'text-app-muted'}`}
                                    >
                                        {item.value}
                                        <ArrowUpRight className="size-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                        {warnings.length > 0 && (
                            <div className="mt-3 grid gap-2">
                                {warnings.slice(0, 3).map((item) => (
                                    <WarningRow key={item.key} item={item} />
                                ))}
                            </div>
                        )}
                    </Panel>

                    <Panel title="Recent activity" icon={Activity}>
                        {recentActivity.length === 0 ? (
                            <EmptyState
                                icon={Activity}
                                title="No activity yet"
                                description="Audited events will appear here as operations are performed."
                            />
                        ) : (
                            <div className="grid gap-2">
                                {recentActivity.slice(0, 5).map((item) => (
                                    <ActivityRow key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </Panel>
                </section>

                {contentReadiness.length > 0 && (
                    <section className="mt-8">
                        <Panel title="Content readiness" icon={Newspaper}>
                            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                {contentReadiness.map((item) => (
                                    <ContentRow key={item.key} item={item} />
                                ))}
                            </div>
                        </Panel>
                    </section>
                )}
            </main>
        </>
    );
}

function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
    href,
    accent,
    meter,
}: {
    label: string;
    value: number;
    detail: string;
    icon: ComponentType<{ className?: string }>;
    href: RouteDefinition<'get'>;
    accent: string;
    meter: number;
}) {
    return (
        <Link
            href={href}
            className="app-panel group block p-4 transition hover:-translate-y-0.5 hover:border-app-ink/20"
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    className={`grid size-9 place-items-center rounded-lg ${accent}`}
                >
                    <Icon className="size-4" />
                </span>
                <ArrowUpRight className="size-4 text-app-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </div>
            <p className="mt-5 text-xs font-semibold text-app-muted">{label}</p>
            <p className="dashboard-display mt-1 text-3xl font-semibold tracking-[-0.06em] text-app-ink tabular-nums">
                {value}
            </p>
            <p className="mt-1 truncate text-xs text-app-muted">{detail}</p>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-app-surface-muted">
                <div
                    className="h-full rounded-full bg-app-ink transition-all duration-500 group-hover:bg-app-red"
                    style={{ width: `${meter}%` }}
                />
            </div>
        </Link>
    );
}

function Panel({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: ComponentType<{ className?: string }>;
    children: ReactNode;
}) {
    return (
        <section className="app-panel min-w-0 overflow-hidden">
            <header className="flex items-center justify-between border-b border-app-border px-4 py-3">
                <h2 className="text-sm font-bold tracking-[-0.01em] text-app-ink">
                    {title}
                </h2>
                <Icon className="size-4 text-app-muted" />
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

function WarningRow({ item }: { item: DashboardWarning }) {
    const severity =
        item.severity === 'high'
            ? 'bg-app-red text-white'
            : item.severity === 'medium'
              ? 'bg-app-brass text-app-ink'
              : 'bg-app-surface-muted text-app-muted';

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-app-border bg-app-surface-muted px-3 py-2.5">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-app-ink">
                    {item.title}
                </p>
                <p className="truncate text-xs text-app-muted">
                    {item.description}
                </p>
            </div>
            <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${severity}`}
            >
                {item.count ?? '!'}
            </span>
        </div>
    );
}

function ActivityRow({ item }: { item: ActivityItem }) {
    return (
        <div className="border-b border-app-border pb-2.5 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
                <p className="truncate text-sm font-semibold text-app-ink">
                    {item.label}
                </p>
                <span className="shrink-0 text-xs text-app-muted">
                    {formatActivityDate(item.created_at)}
                </span>
            </div>
            <p className="mt-1 truncate text-xs text-app-muted">
                {item.description ?? 'System activity'}
            </p>
        </div>
    );
}

function ContentRow({ item }: { item: ContentReadinessItem }) {
    return (
        <div className="rounded-lg border border-app-border p-3">
            <div className="flex items-center gap-2">
                {item.ready ? (
                    <CheckCircle2 className="size-4 text-app-teal dark:text-app-brass" />
                ) : (
                    <span className="size-2 rounded-full bg-app-brass" />
                )}
                <p className="text-sm font-semibold text-app-ink">
                    {item.title}
                </p>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-app-muted">
                {item.description}
            </p>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-app-border px-4 text-center">
            <div>
                <Icon className="mx-auto mb-2 size-6 text-app-muted" />
                <p className="text-sm font-semibold text-app-ink">{title}</p>
                <p className="mt-1 text-xs text-app-muted">{description}</p>
            </div>
        </div>
    );
}

function percent(value: number, total: number) {
    if (total <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function formatActivityDate(value: string | null) {
    return value === null
        ? 'Now'
        : new Date(value).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
          });
}

function filterQuery(filters: ReportFilters) {
    const query: Record<string, string | number> = {
        period: filters.preset,
    };

    if (filters.start_date !== null) {
        query.start_date = filters.start_date;
    }

    if (filters.end_date !== null) {
        query.end_date = filters.end_date;
    }

    if (filters.year !== null) {
        query.year = filters.year;
    }

    if (filters.academic_period_id !== null) {
        query.academic_period_id = filters.academic_period_id;
    }

    return query;
}

function titleCase(value: string) {
    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
