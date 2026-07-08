import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    CalendarRange,
    CreditCard,
    Download,
    FileText,
    Filter,
    IdCard,
    Landmark,
    ShieldCheck,
    Users,
    Wifi,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { exportMethod, index } from '@/routes/reports';

type ReportGroups = Record<string, Record<string, number>>;

type ReportFilters = {
    preset: string;
    start_date: string | null;
    end_date: string | null;
    year: number | null;
    academic_period_id: number | null;
    label: string;
};

type FilterOptions = {
    years: { key: number; label: string }[];
    academic_periods: {
        id: number;
        name: string;
        academic_year: string | null;
    }[];
};

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

export default function ReportsIndex({
    reports,
    summary,
    filters,
    filterOptions,
}: {
    reports: ReportGroups;
    summary: Record<string, number>;
    filters: ReportFilters;
    filterOptions: FilterOptions;
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

    const highestTotal = Math.max(1, ...groups.map((group) => group.total));
    const reportQuery = filterQuery(filters);

    return (
        <>
            <Head title="Reports" />

            <div className="app-page p-4 md:p-6">
                <section className="theme-ink-panel grid min-w-0 gap-5 overflow-hidden rounded-[1.35rem] border border-app-border p-5 shadow-[0_24px_80px_rgba(17,24,19,0.18)] lg:grid-cols-[minmax(0,1fr)_minmax(16rem,26rem)]">
                    <div className="min-w-0">
                        <p className="inline-flex items-center gap-2 rounded-md bg-app-brass px-3 py-1.5 text-xs font-black tracking-[0.2em] text-[#1c1826] uppercase">
                            <FileText className="size-4" />
                            Operational reporting
                        </p>
                        <h1 className="mt-5 max-w-3xl text-4xl leading-none font-black tracking-normal text-white md:text-6xl">
                            Executive report room.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                            A board-ready view of {filters.label}: students,
                            permits, payments, verification, elections, and
                            operational exceptions in one place.
                        </p>
                    </div>

                    <div className="grid content-end gap-3">
                        <OverviewStat
                            label="Period"
                            value={filters.label}
                            icon={Landmark}
                        />
                        <OverviewStat
                            label="Report groups"
                            value={groups.length}
                            icon={BarChart3}
                        />
                        <OverviewStat
                            label="Tracked records"
                            value={groups.reduce(
                                (sum, group) => sum + group.total,
                                0,
                            )}
                            icon={Activity}
                        />
                    </div>
                </section>

                <ReportFilterBar
                    filters={filters}
                    filterOptions={filterOptions}
                    routeUrl={index.url()}
                />

                <section className="mt-5 grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
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
                    <div className="app-panel grid gap-2 p-3">
                        <Link
                            href={exportMethod('pdf', { query: reportQuery })}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[0.75rem] bg-app-red px-4 text-sm font-semibold text-white"
                        >
                            <Download className="size-4" />
                            PDF
                        </Link>
                        <Link
                            href={exportMethod('csv', { query: reportQuery })}
                            className="theme-primary-active inline-flex h-10 items-center justify-center gap-2 rounded-[0.75rem] px-4 text-sm font-semibold"
                        >
                            <Download className="size-4" />
                            Excel
                        </Link>
                    </div>
                </section>

                <section className="app-panel mt-5 min-w-0 overflow-hidden p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-black tracking-[0.18em] text-app-red uppercase">
                                Cross-module totals
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-normal">
                                Overview distribution
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-app-muted">
                            Totals are grouped by module so operational spikes
                            are visible without opening each report.
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

function OverviewStat({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number | string;
    icon: ComponentType<{ className?: string }>;
}) {
    return (
        <div className="rounded-[1rem] border border-white/12 bg-white/8 p-4 text-white backdrop-blur">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black tracking-[0.18em] text-white/64 uppercase">
                    {label}
                </p>
                <Icon className="size-5 text-app-brass" />
            </div>
            <p className="mt-3 text-3xl leading-tight font-black text-white tabular-nums">
                {value}
            </p>
        </div>
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

function ReportFilterBar({
    filters,
    filterOptions,
    routeUrl,
}: {
    filters: ReportFilters;
    filterOptions: FilterOptions;
    routeUrl: string;
}) {
    const [period, setPeriod] = useState(filters.preset);
    const activeLabel = periodLabel(period);
    const activeDetail =
        period === filters.preset
            ? filters.label
            : periodPreview(period, filters, filterOptions);

    function submit(form: HTMLFormElement) {
        router.get(routeUrl, filterFormQuery(new FormData(form), period), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <form
            className="mt-5 overflow-hidden rounded-[1.15rem] border border-app-border bg-app-surface shadow-[0_16px_44px_rgba(17,24,19,0.08)] dark:shadow-none"
            onSubmit={(event) => {
                event.preventDefault();
                submit(event.currentTarget);
            }}
        >
            <input type="hidden" name="period" value={period} />

            <div className="grid gap-0 xl:grid-cols-[18rem_minmax(0,1fr)_auto]">
                <div className="theme-ink-panel flex items-center gap-3 p-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-app-brass">
                        <Filter className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black tracking-[0.2em] text-white/55 uppercase">
                            Report scope
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-white">
                            {activeLabel}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 p-4 lg:grid-cols-[minmax(13rem,18rem)_minmax(0,1fr)] lg:items-end">
                    <label className="grid min-w-0 gap-1.5">
                        <span className="text-[10px] font-black tracking-[0.18em] text-app-muted uppercase">
                            Period
                        </span>
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="h-11 w-full rounded-[0.8rem] border-app-border bg-app-surface-muted px-3 text-sm font-black text-app-ink">
                                <SelectValue placeholder="Choose period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="current_month">
                                    This month
                                </SelectItem>
                                <SelectItem value="current_year">
                                    This year
                                </SelectItem>
                                <SelectItem value="year">
                                    Select year
                                </SelectItem>
                                <SelectItem value="academic_period">
                                    Academic year
                                </SelectItem>
                                <SelectItem value="custom">
                                    Date range
                                </SelectItem>
                                <SelectItem value="all">All records</SelectItem>
                            </SelectContent>
                        </Select>
                    </label>

                    <div className="min-w-0">
                        {period === 'custom' && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <DateField
                                    label="Start"
                                    name="start_date"
                                    value={filters.start_date}
                                />
                                <DateField
                                    label="End"
                                    name="end_date"
                                    value={filters.end_date}
                                />
                            </div>
                        )}

                        {period === 'year' && (
                            <SelectField label="Year">
                                <Select
                                    name="year"
                                    defaultValue={String(
                                        filters.year ??
                                            new Date().getFullYear(),
                                    )}
                                >
                                    <SelectTrigger className="h-11 w-full rounded-[0.8rem] border-app-border bg-app-surface-muted px-3 text-sm font-black text-app-ink">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.years.map((year) => (
                                            <SelectItem
                                                key={year.key}
                                                value={String(year.key)}
                                            >
                                                {year.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </SelectField>
                        )}

                        {period === 'academic_period' && (
                            <SelectField label="Academic year">
                                <Select
                                    name="academic_period_id"
                                    defaultValue={String(
                                        filters.academic_period_id ?? '',
                                    )}
                                >
                                    <SelectTrigger className="h-11 w-full rounded-[0.8rem] border-app-border bg-app-surface-muted px-3 text-sm font-black text-app-ink">
                                        <SelectValue placeholder="Active period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.academic_periods.map(
                                            (item) => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={String(item.id)}
                                                >
                                                    {item.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </SelectField>
                        )}

                        {['current_month', 'current_year', 'all'].includes(
                            period,
                        ) && (
                            <div className="flex min-h-11 items-center gap-3 rounded-[0.8rem] border border-dashed border-app-border bg-app-surface-muted px-3">
                                <CalendarRange className="size-4 shrink-0 text-app-red" />
                                <p className="truncate text-sm font-black text-app-ink">
                                    {activeDetail}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-app-border p-4 xl:border-t-0 xl:border-l">
                    <div className="min-w-0 xl:w-40">
                        <p className="text-[10px] font-black tracking-[0.18em] text-app-muted uppercase">
                            Active range
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-app-ink">
                            {activeDetail}
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="theme-primary-active h-11 rounded-[0.8rem] px-5 text-sm font-semibold"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </form>
    );
}

function DateField({
    label,
    name,
    value,
}: {
    label: string;
    name: string;
    value: string | null;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-[10px] font-black tracking-[0.18em] text-app-muted uppercase">
                {label}
            </span>
            <input
                name={name}
                type="date"
                defaultValue={value ?? ''}
                className="h-11 rounded-[0.8rem] border border-app-border bg-app-surface-muted px-3 text-sm font-black text-app-ink"
            />
        </label>
    );
}

function SelectField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-[10px] font-black tracking-[0.18em] text-app-muted uppercase">
                {label}
            </span>
            {children}
        </label>
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

function filterFormQuery(formData: FormData, selectedPeriod?: string) {
    const period =
        selectedPeriod ?? String(formData.get('period') ?? 'current_month');
    const query: Record<string, string | number> = { period };

    if (period === 'custom') {
        query.start_date = String(formData.get('start_date') ?? '');
        query.end_date = String(formData.get('end_date') ?? '');
    }

    if (period === 'year' || period === 'current_year') {
        query.year = Number(formData.get('year') || new Date().getFullYear());
    }

    if (period === 'academic_period') {
        query.academic_period_id = Number(formData.get('academic_period_id'));
    }

    return query;
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

function periodLabel(period: string) {
    return (
        {
            current_month: 'This month',
            current_year: 'This year',
            year: 'Selected year',
            academic_period: 'Academic year',
            custom: 'Date range',
            all: 'All records',
        }[period] ?? 'Report period'
    );
}

function periodPreview(
    period: string,
    filters: ReportFilters,
    filterOptions: FilterOptions,
) {
    if (period === 'year') {
        return String(filters.year ?? new Date().getFullYear());
    }

    if (period === 'academic_period') {
        return (
            filterOptions.academic_periods.find(
                (item) => item.id === filters.academic_period_id,
            )?.name ?? 'Active academic period'
        );
    }

    if (period === 'custom') {
        return [
            filters.start_date ?? 'Start date',
            filters.end_date ?? 'End date',
        ].join(' - ');
    }

    return periodLabel(period);
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

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: index(),
        },
    ],
};
