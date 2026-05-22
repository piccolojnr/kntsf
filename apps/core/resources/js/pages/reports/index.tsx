import { Head } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    CreditCard,
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
    LabelList,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { index } from '@/routes/reports';

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
        color: '#0f766e',
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

export default function ReportsIndex({ reports }: { reports: ReportGroups }) {
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

    return (
        <>
            <Head title="Reports" />

            <div className="app-page p-4 md:p-6">
                <section className="app-panel grid min-w-0 gap-5 overflow-hidden p-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,26rem)]">
                    <div className="min-w-0">
                        <p className="inline-flex items-center gap-2 rounded-md bg-app-ink px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-app-surface dark:bg-app-surface dark:text-app-ink">
                            <FileText className="size-4" />
                            Operational reporting
                        </p>
                        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-none tracking-normal md:text-6xl">
                            Reports that stay close to the work.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-app-muted">
                            Lightweight counts across students, permits, NFC
                            cards, payments, and verification. These charts are
                            designed for quick operational review, not heavy
                            analytics.
                        </p>
                    </div>

                    <div className="grid content-end gap-3">
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

                <section className="app-panel mt-5 min-w-0 overflow-hidden p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-app-red">
                                Cross-module totals
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-normal">
                                Overview distribution
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-app-muted">
                            Totals are grouped by module so operational spikes are
                            visible without opening each report.
                        </p>
                    </div>

                    <ChartContainer
                        config={overviewConfig}
                        className="mt-6 h-[320px] min-w-0 w-full"
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
                        <h2 className="break-words text-xl font-black tracking-normal">
                            {group.title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-app-muted">
                            {group.description}
                        </p>
                    </div>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-app-muted">
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
                    className="h-[260px] min-w-0 w-full overflow-hidden"
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
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
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
                                <p className="min-w-0 truncate text-xs font-black uppercase tracking-[0.14em] text-app-muted">
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
    value: number;
    icon: ComponentType<{ className?: string }>;
}) {
    return (
        <div className="app-panel-muted p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-app-muted">
                    {label}
                </p>
                <Icon className="size-5 text-app-red" />
            </div>
            <p className="mt-3 text-4xl font-black tabular-nums">{value}</p>
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
