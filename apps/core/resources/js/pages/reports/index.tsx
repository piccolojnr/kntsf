import { Head } from '@inertiajs/react';
import {
    CreditCard,
    Download,
    FileText,
    IdCard,
    ShieldCheck,
    Users,
    Wifi,
} from 'lucide-react';
import type { ComponentType } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    LabelList,
    Area,
    AreaChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ReportScopeFilter } from '@/components/shared/report-scope-filter';
import type {
    ReportFilterOptions,
    ReportFilters,
} from '@/components/shared/report-scope-filter';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { exportMethod, index } from '@/routes/reports';

type ReportGroups = Record<string, Record<string, number>>;

type ReportMeta = {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    color: string;
};

const reportMeta: Record<string, ReportMeta> = {
    students: {
        title: 'Students',
        description: 'Account, profile, and registry coverage.',
        icon: Users,
        color: '#442e66',
    },
    permits: {
        title: 'Permits',
        description: 'Permit lifecycle and validity totals.',
        icon: IdCard,
        color: '#b45309',
    },
    nfc_cards: {
        title: 'NFC Cards',
        description: 'Assigned card status and operational coverage.',
        icon: Wifi,
        color: '#0369a1',
    },
    payments: {
        title: 'Payments',
        description: 'Manual payment confirmation totals.',
        icon: CreditCard,
        color: '#15803d',
    },
    permit_requests: {
        title: 'Permit Requests',
        description: 'Self-service recovery and stuck request totals.',
        icon: FileText,
        color: '#7c3aed',
    },
    verification: {
        title: 'Verification',
        description: 'Manual verification attempts and outcomes.',
        icon: ShieldCheck,
        color: '#b91c1c',
    },
};

const overviewConfig = {
    total: {
        label: 'Total',
        color: '#17211b',
    },
};

const executivePalette = [
    '#17211b',
    '#b45309',
    '#0369a1',
    '#15803d',
    '#7c3aed',
    '#b91c1c',
    '#6b5d45',
];

export default function ReportsIndex({
    reports,
    summary,
    filters,
    filterOptions,
}: {
    reports: ReportGroups;
    summary: Record<string, number>;
    filters: ReportFilters;
    filterOptions: ReportFilterOptions;
}) {
    const groups = Object.entries(reports ?? {}).map(([key, values]) => {
        const meta = reportMeta[key] ?? fallbackMeta(key);
        const entries = Object.entries(values ?? {});
        const total = entries.reduce((sum, [, value]) => sum + value, 0);

        return {
            key,
            ...meta,
            entries,
            total,
        };
    });

    const overviewData = groups.map((group) => ({
        key: group.key,
        label: group.title,
        total: group.total,
        fill: group.color,
    }));
    const totalTrackedRecords = groups.reduce(
        (sum, group) => sum + group.total,
        0,
    );
    const moduleMixData = overviewData.map((item, index) => ({
        ...item,
        fill: executivePalette[index % executivePalette.length],
    }));
    const operationalHealth = buildOperationalHealth(summary, reports);
    const activityCurve = groups.map((group, index) => ({
        label: group.title,
        activity: group.total,
        index: index + 1,
    }));
    const watchItems = buildWatchItems(reports);

    const highestTotal = Math.max(1, ...groups.map((group) => group.total));
    const reportQuery = filterQuery(filters);

    return (
        <>
            <Head title="Reports" />

            <div className="app-page w-full max-w-full overflow-x-hidden px-4 pb-12 md:px-7 lg:px-9">
                <header className="flex flex-col gap-4 border-b border-app-border py-7 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-app-muted uppercase">
                            Operational reporting
                        </p>
                        <h1 className="dashboard-display mt-2 text-4xl font-semibold tracking-[-0.055em] text-app-ink md:text-5xl">
                            Reports
                        </h1>
                        <p className="mt-2 text-sm text-app-muted">
                            {filters.label} · {groups.length} report groups ·{' '}
                            {totalTrackedRecords} tracked records
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={exportMethod.url('pdf', {
                                query: reportQuery,
                            })}
                            className="inline-flex items-center gap-2 rounded-lg bg-app-red px-3.5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            <Download className="size-4" />
                            PDF
                        </a>
                        <a
                            href={exportMethod.url('excel', {
                                query: reportQuery,
                            })}
                            className="theme-primary-active inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition hover:bg-app-red"
                        >
                            <Download className="size-4" />
                            Excel
                        </a>
                        <a
                            href={exportMethod.url('csv', {
                                query: reportQuery,
                            })}
                            className="hidden items-center gap-2 rounded-lg border border-app-border px-3.5 py-2.5 text-sm font-semibold text-app-ink transition hover:bg-app-surface-muted sm:inline-flex"
                        >
                            <Download className="size-4" />
                            CSV
                        </a>
                    </div>
                </header>

                <ReportScopeFilter
                    filters={filters}
                    filterOptions={filterOptions}
                    routeUrl={index.url()}
                />

                <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ExecutiveStat
                        label="Students"
                        value={summary.total_students ?? 0}
                        detail="In selected period"
                    />
                    <ExecutiveStat
                        label="Active permits"
                        value={summary.active_permits ?? 0}
                        detail="Valid in period"
                    />
                    <ExecutiveStat
                        label="Successful payments"
                        value={summary.successful_payments ?? 0}
                        detail="Paid in period"
                    />
                    <ExecutiveStat
                        label="Verification attempts"
                        value={summary.verification_attempts ?? 0}
                        detail="Operational checks"
                    />
                </section>

                <section className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
                    <div className="app-panel min-w-0 overflow-hidden p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.14em] text-app-red uppercase">
                                    Cross-module totals
                                </p>
                                <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-app-ink">
                                    Overview distribution
                                </h2>
                            </div>
                            <p className="max-w-md text-sm leading-6 text-app-muted">
                                Totals are grouped by module so operational
                                spikes are visible without opening each report.
                            </p>
                        </div>

                        <ChartContainer
                            config={overviewConfig}
                            className="mt-6 h-[320px] w-full min-w-0"
                        >
                            <BarChart
                                accessibilityLayer
                                data={overviewData}
                                margin={{
                                    top: 24,
                                    right: 12,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={12}
                                    tickFormatter={shortLabel}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    <LabelList
                                        dataKey="total"
                                        position="top"
                                        className="fill-foreground font-bold"
                                    />
                                    {overviewData.map((item) => (
                                        <Cell key={item.key} fill={item.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>

                    <div className="app-panel min-w-0 overflow-hidden p-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.14em] text-app-red uppercase">
                                Module mix
                            </p>
                            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-app-ink">
                                Share of activity
                            </h2>
                        </div>
                        <ChartContainer
                            config={overviewConfig}
                            className="mx-auto mt-4 h-[260px] w-full max-w-sm"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={moduleMixData}
                                    dataKey="total"
                                    nameKey="label"
                                    innerRadius={58}
                                    outerRadius={98}
                                    paddingAngle={3}
                                >
                                    {moduleMixData.map((item) => (
                                        <Cell key={item.key} fill={item.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        <div className="mt-2 grid gap-2">
                            {moduleMixData.slice(0, 5).map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between gap-3 text-sm"
                                >
                                    <span className="flex min-w-0 items-center gap-2 font-semibold">
                                        <span
                                            className="size-2.5 rounded-full"
                                            style={{
                                                backgroundColor: item.fill,
                                            }}
                                        />
                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    </span>
                                    <span className="font-black tabular-nums">
                                        {percent(
                                            item.total,
                                            Math.max(totalTrackedRecords, 1),
                                        )}
                                        %
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="app-panel min-w-0 overflow-hidden p-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.14em] text-app-red uppercase">
                                Operating health
                            </p>
                            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-app-ink">
                                Coverage indicators
                            </h2>
                        </div>
                        <ChartContainer
                            config={overviewConfig}
                            className="mx-auto mt-4 h-[290px] w-full max-w-md"
                        >
                            <RadialBarChart
                                data={operationalHealth}
                                innerRadius="18%"
                                outerRadius="96%"
                                startAngle={90}
                                endAngle={-270}
                            >
                                <PolarAngleAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tick={false}
                                />
                                <RadialBar
                                    dataKey="score"
                                    background
                                    cornerRadius={8}
                                />
                                <Tooltip />
                            </RadialBarChart>
                        </ChartContainer>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {operationalHealth.map((item) => (
                                <div
                                    key={item.label}
                                    className="app-panel-muted flex items-center justify-between gap-3 p-3"
                                >
                                    <span className="text-sm font-semibold text-app-muted">
                                        {item.label}
                                    </span>
                                    <span className="text-lg font-black tabular-nums">
                                        {item.score}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="app-panel min-w-0 overflow-hidden p-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.14em] text-app-red uppercase">
                                Activity curve
                            </p>
                            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-app-ink">
                                Relative movement by module
                            </h2>
                        </div>
                        <ChartContainer
                            config={overviewConfig}
                            className="mt-5 h-[300px] w-full min-w-0"
                        >
                            <AreaChart
                                accessibilityLayer
                                data={activityCurve}
                                margin={{
                                    top: 16,
                                    right: 12,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="activityGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#b45309"
                                            stopOpacity={0.45}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#b45309"
                                            stopOpacity={0.04}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={shortLabel}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activity"
                                    stroke="#b45309"
                                    strokeWidth={3}
                                    fill="url(#activityGradient)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                </section>

                <section className="app-panel mt-4 min-w-0 overflow-hidden p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-black tracking-[0.18em] text-app-red uppercase">
                                Executive watch list
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-normal">
                                Exceptions and follow-up points
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-app-muted">
                            These indicators help executives quickly see where
                            attention is needed before the next operational
                            review.
                        </p>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {watchItems.map((item) => (
                            <div
                                key={item.label}
                                className="app-panel-muted min-w-0 p-4"
                            >
                                <p className="text-xs font-black tracking-[0.16em] text-app-muted uppercase">
                                    {item.group}
                                </p>
                                <p className="mt-2 truncate text-sm font-semibold">
                                    {item.label}
                                </p>
                                <p className="mt-3 text-3xl font-black tabular-nums">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-2">
                    {groups.map((group) => (
                        <ReportPanel
                            key={group.key}
                            group={group}
                            highestTotal={highestTotal}
                        />
                    ))}
                </section>
            </div>
        </>
    );
}

function ReportPanel({
    group,
    highestTotal,
}: {
    group: ReturnType<typeof fallbackMeta> & {
        key: string;
        entries: [string, number][];
        total: number;
    };
    highestTotal: number;
}) {
    const Icon = group.icon;
    const chartData = group.entries.map(([label, value], index) => ({
        label: titleCase(label),
        value,
        fill: tint(group.color, index),
    }));
    const config = {
        value: {
            label: group.title,
            color: group.color,
        },
    };

    return (
        <article className="app-panel min-w-0 overflow-hidden">
            <header className="flex flex-col gap-4 border-b border-app-border p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                    <div
                        className="grid size-12 shrink-0 place-items-center rounded-md text-white"
                        style={{ backgroundColor: group.color }}
                    >
                        <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-black tracking-normal break-words">
                            {group.title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-app-muted">
                            {group.description}
                        </p>
                    </div>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                    <p className="text-xs font-black tracking-[0.18em] text-app-muted uppercase">
                        Total
                    </p>
                    <p className="mt-1 text-3xl font-black tabular-nums">
                        {group.total}
                    </p>
                </div>
            </header>

            <div className="grid min-w-0 gap-5 p-5 2xl:grid-cols-[minmax(0,1fr)_13rem]">
                <ChartContainer
                    config={config}
                    className="h-[260px] w-full min-w-0 overflow-hidden"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            top: 4,
                            right: 18,
                            left: 0,
                            bottom: 4,
                        }}
                    >
                        <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                        />
                        <XAxis
                            type="number"
                            hide
                            domain={[0, 'dataMax']}
                            allowDecimals={false}
                        />
                        <YAxis
                            dataKey="label"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                            width={104}
                            tickFormatter={truncateLabel}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="value" radius={4}>
                            <LabelList
                                dataKey="value"
                                position="right"
                                className="fill-foreground font-bold"
                            />
                            {chartData.map((item) => (
                                <Cell key={item.label} fill={item.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>

                <div className="grid min-w-0 content-start gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                    {group.entries.map(([label, value]) => (
                        <div
                            key={label}
                            className="app-panel-muted min-w-0 p-3"
                        >
                            <div className="flex min-w-0 items-center justify-between gap-3">
                                <p className="min-w-0 truncate text-xs font-black tracking-[0.14em] text-app-muted uppercase">
                                    {titleCase(label)}
                                </p>
                                <p className="font-black tabular-nums">
                                    {value}
                                </p>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-app-border">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${percent(value, Math.max(group.total, highestTotal))}%`,
                                        backgroundColor: group.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}

function ExecutiveStat({
    label,
    value,
    detail,
}: {
    label: string;
    value: number;
    detail: string;
}) {
    return (
        <div className="app-panel p-4">
            <p className="text-xs font-black tracking-[0.16em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-2 text-3xl font-black text-app-ink tabular-nums">
                {value}
            </p>
            <p className="mt-1 text-sm text-app-muted">{detail}</p>
        </div>
    );
}

function fallbackMeta(key: string): ReportMeta {
    return {
        title: titleCase(key),
        description: 'Operational report counts.',
        icon: FileText,
        color: '#6b5d45',
    };
}

function titleCase(value: string) {
    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function shortLabel(value: string) {
    if (value === 'NFC Cards') {
        return 'NFC';
    }

    if (value === 'Verification') {
        return 'Verify';
    }

    return value;
}

function truncateLabel(value: string) {
    return value.length > 14 ? `${value.slice(0, 12)}...` : value;
}

function percent(value: number, total: number) {
    if (total <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
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

function tint(color: string, index: number) {
    const opacity = Math.max(0.38, 1 - index * 0.12);

    return hexToRgba(color, opacity);
}

function hexToRgba(hex: string, opacity: number) {
    const normalized = hex.replace('#', '');
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function buildOperationalHealth(
    summary: Record<string, number>,
    reports: ReportGroups,
) {
    const students = summary.total_students ?? 0;
    const activated = summary.activated_student_accounts ?? 0;
    const activePermits = summary.active_permits ?? 0;
    const verificationAttempts = summary.verification_attempts ?? 0;
    const failedVerification = summary.failed_verification_attempts ?? 0;
    const stuckRequests = summary.stuck_permit_requests ?? 0;
    const permitRequestsTotal = Object.values(
        reports.permit_requests ?? {},
    ).reduce((sum, value) => sum + value, 0);

    return [
        {
            label: 'Account activation',
            score: percent(activated, Math.max(students, 1)),
            fill: '#15803d',
        },
        {
            label: 'Permit coverage',
            score: percent(activePermits, Math.max(students, 1)),
            fill: '#b45309',
        },
        {
            label: 'Verification quality',
            score:
                verificationAttempts > 0
                    ? Math.max(
                          0,
                          100 -
                              percent(failedVerification, verificationAttempts),
                      )
                    : 100,
            fill: '#0369a1',
        },
        {
            label: 'Request recovery',
            score:
                permitRequestsTotal > 0
                    ? Math.max(
                          0,
                          100 - percent(stuckRequests, permitRequestsTotal),
                      )
                    : 100,
            fill: '#7c3aed',
        },
    ];
}

function buildWatchItems(reports: ReportGroups) {
    const items = [
        {
            group: 'Students',
            label: 'Pending setup',
            value: reports.students?.pending_setup ?? 0,
        },
        {
            group: 'Permits',
            label: 'Expiring soon',
            value: reports.permits?.expiring_soon ?? 0,
        },
        {
            group: 'Payments',
            label: 'Pending payments',
            value: reports.payments?.pending ?? 0,
        },
        {
            group: 'Requests',
            label: 'Paid not issued',
            value: reports.permit_requests?.paid_not_issued ?? 0,
        },
        {
            group: 'Verification',
            label: 'Failed checks',
            value: reports.verification?.failed ?? 0,
        },
        {
            group: 'Elections',
            label: 'Pending candidates',
            value: reports.elections?.pending_candidates ?? 0,
        },
    ];

    return items.sort((left, right) => right.value - left.value).slice(0, 4);
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: index(),
        },
    ],
};
