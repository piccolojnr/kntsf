import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BadgeCheck,
    BarChart3,
    CalendarRange,
    CheckCircle2,
    CreditCard,
    Crown,
    Download,
    Filter,
    IdCard,
    Landmark,
    Newspaper,
    Radar,
    ShieldCheck,
    Users,
    Wifi,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    filterOptions: FilterOptions;
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
    const verificationSuccessRate =
        100 -
        percent(
            summary.failed_verification_attempts_today,
            summary.verification_attempts_today,
        );
    const verificationSuccessLabel =
        summary.verification_attempts_today > 0
            ? `${verificationSuccessRate}%`
            : 'No checks';
    const permitPressure =
        summary.active_permits +
        summary.expired_permits +
        summary.revoked_permits;
    const stuckPermitRequests = summary.stuck_permit_requests ?? 0;
    const paidUnissuedPermitRequests =
        summary.paid_unissued_permit_requests ?? 0;
    const reportQuery = filterQuery(filters);

    const commandCards = [
        {
            label: 'Student registry',
            value: summary.total_students,
            detail: `${activationRate}% activated`,
            icon: Users,
            tone: 'teal',
            meter: activationRate,
            href: studentsIndex(),
        },
        {
            label: 'Active permits',
            value: summary.active_permits,
            detail: `${summary.expired_permits} expired / ${summary.revoked_permits} revoked`,
            icon: IdCard,
            tone: 'brass',
            meter: percent(summary.active_permits, permitPressure),
            href: permitsIndex(),
        },
        {
            label: 'NFC coverage',
            value: summary.active_nfc_cards,
            detail: 'Active cards assigned',
            icon: Wifi,
            tone: 'ink',
            meter: percent(summary.active_nfc_cards, summary.total_students),
            href: nfcCardsIndex(),
        },
        {
            label: 'Payment confirmations',
            value: summary.successful_payments,
            detail: `${summary.pending_payments} pending`,
            icon: CreditCard,
            tone: 'red',
            meter: percent(
                summary.successful_payments,
                summary.successful_payments + summary.pending_payments,
            ),
            href: paymentsIndex(),
        },
    ] as const;

    const triageItems = [
        {
            label: 'Stuck requests',
            value: stuckPermitRequests,
            detail: 'Permit requests that need recovery',
            href: permitRequestsIndex(),
            alert: stuckPermitRequests > 0,
        },
        {
            label: 'Paid, not issued',
            value: paidUnissuedPermitRequests,
            detail: 'Payments confirmed before permit issue',
            href: permitRequestsIndex(),
            alert: paidUnissuedPermitRequests > 0,
        },
        {
            label: 'Failed checks',
            value: summary.failed_verification_attempts_today,
            detail: 'Verification issues today',
            href: permitRequestsIndex(),
            alert: summary.failed_verification_attempts_today > 0,
        },
    ] as const;

    return (
        <>
            <Head title="Dashboard" />
            <main className="app-page p-4 md:p-6">
                <section className="theme-ink-panel relative overflow-hidden rounded-[1.35rem] border border-app-border shadow-[0_24px_80px_rgba(17,24,19,0.18)]">
                    <div
                        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[34px_34px]"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute top-8 right-10 size-32 rounded-full border border-dashed border-white/16"
                        aria-hidden="true"
                    />
                    <div className="relative grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:p-8">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-app-brass px-3 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#1c1826] uppercase">
                                <Landmark className="size-4" />
                                SRC control room
                            </p>
                            <h1 className="mt-6 max-w-4xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-white md:text-6xl">
                                Operations overview
                            </h1>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">
                                Executive summary for {filters.label}, covering
                                student records, permits, NFC cards, payments,
                                verification, publishing, and elections.
                            </p>
                        </div>
                        <div className="grid content-end gap-3">
                            <StatusPlate
                                label="Warnings"
                                value={warnings.length}
                                icon={AlertTriangle}
                                alert={warnings.length > 0}
                            />
                            <StatusPlate
                                label="Verification success"
                                value={verificationSuccessLabel}
                                icon={ShieldCheck}
                            />
                        </div>
                    </div>
                </section>

                <ReportFilterBar
                    filters={filters}
                    filterOptions={filterOptions}
                    routeUrl={dashboard.url()}
                />

                <section className="mt-5 grid gap-3 lg:grid-cols-3">
                    {triageItems.map((item) => (
                        <TriageLink key={item.label} {...item} />
                    ))}
                </section>

                <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {commandCards.map((card) => (
                        <CommandCard key={card.label} {...card} />
                    ))}
                </section>

                <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
                    <Panel
                        title="Period report"
                        eyebrow={filters.label}
                        icon={BarChart3}
                    >
                        <div className="grid gap-3 md:grid-cols-3">
                            <SignalCard
                                label="Verification attempts"
                                value={summary.verification_attempts}
                                detail={`${summary.failed_verification_attempts} failed in this period`}
                                icon={Radar}
                            />
                            <SignalCard
                                label="Election votes"
                                value={summary.election_votes}
                                detail="Votes cast in this period"
                                icon={Crown}
                            />
                            <SignalCard
                                label="Paid, not issued"
                                value={paidUnissuedPermitRequests}
                                detail="Permit requests awaiting completion"
                                icon={AlertTriangle}
                            />
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {Object.entries(reports).map(([group, values]) => (
                                <MiniReportGroup
                                    key={group}
                                    title={titleCase(group)}
                                    values={values}
                                />
                            ))}
                        </div>
                    </Panel>
                    <Panel
                        title="Executive exports"
                        eyebrow="Share"
                        icon={Download}
                    >
                        <div className="grid gap-3">
                            <Link
                                href={reportsIndex({ query: reportQuery })}
                                className="theme-primary-active inline-flex items-center justify-center gap-2 rounded-[0.8rem] px-4 py-3 text-sm font-semibold"
                            >
                                <BarChart3 className="size-4" />
                                Open full report
                            </Link>
                            <p className="text-sm leading-6 text-app-muted">
                                The reports page exports this same period as PDF
                                or Excel-compatible CSV.
                            </p>
                        </div>
                    </Panel>
                </section>

                <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
                    <div className="grid gap-5">
                        <div className="grid gap-4 lg:grid-cols-3">
                            <SignalCard
                                label="Verification attempts today"
                                value={summary.verification_attempts_today}
                                detail={`${summary.failed_verification_attempts_today} failed checks`}
                                icon={Radar}
                            />
                            <SignalCard
                                label="Election activity"
                                value={summary.active_elections}
                                detail={`${summary.pending_candidates} pending candidates / ${summary.election_votes_today} votes today`}
                                icon={Crown}
                            />
                            <SignalCard
                                label="Account setup queue"
                                value={summary.pending_setup_student_accounts}
                                detail="Students waiting to finish setup"
                                icon={BadgeCheck}
                            />
                        </div>

                        <Panel
                            title="Operational warnings"
                            eyebrow="Attention queue"
                            icon={AlertTriangle}
                        >
                            {warnings.length === 0 ? (
                                <EmptyState
                                    icon={ShieldCheck}
                                    title="No warnings right now"
                                    description="The current operational checks are clean."
                                />
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {warnings.map((item) => (
                                        <WarningRow
                                            key={item.key}
                                            item={item}
                                        />
                                    ))}
                                </div>
                            )}
                        </Panel>

                        {contentReadiness.length > 0 && (
                            <Panel
                                title="Content readiness"
                                eyebrow="Publishing board"
                                icon={Newspaper}
                            >
                                <div className="grid gap-3 md:grid-cols-2">
                                    {contentReadiness.map((item) => (
                                        <ContentRow
                                            key={item.key}
                                            item={item}
                                        />
                                    ))}
                                </div>
                            </Panel>
                        )}
                    </div>

                    <Panel
                        title="Recent activity"
                        eyebrow="Audit stream"
                        icon={Activity}
                    >
                        {recentActivity.length === 0 ? (
                            <EmptyState
                                icon={Activity}
                                title="No activity yet"
                                description="Audited events will appear here as operations are performed."
                            />
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((item) => (
                                    <ActivityRow key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </Panel>
                </section>
            </main>
        </>
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
        const query = filterFormQuery(new FormData(form), period);

        router.get(routeUrl, query, {
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
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-white/55 uppercase">
                            Report scope
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-white">
                            {activeLabel}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 p-4 lg:grid-cols-[minmax(13rem,18rem)_minmax(0,1fr)] lg:items-end">
                    <label className="grid min-w-0 gap-1.5">
                        <span className="text-[10px] font-semibold tracking-[0.18em] text-app-muted uppercase">
                            Period
                        </span>
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="h-11 w-full rounded-[0.8rem] border-app-border bg-app-surface-muted px-3 text-sm font-semibold text-app-ink">
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
                                    <SelectTrigger className="h-11 w-full rounded-[0.8rem] border-app-border bg-app-surface-muted px-3 text-sm font-semibold text-app-ink">
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
                                    <SelectTrigger className="h-11 w-full rounded-[0.8rem] border-app-border bg-app-surface-muted px-3 text-sm font-semibold text-app-ink">
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
                                <p className="truncate text-sm font-semibold text-app-ink">
                                    {activeDetail}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-app-border p-4 xl:border-t-0 xl:border-l">
                    <div className="min-w-0 xl:w-40">
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-app-muted uppercase">
                            Active range
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-app-ink">
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
            <span className="text-[10px] font-semibold tracking-[0.18em] text-app-muted uppercase">
                {label}
            </span>
            <input
                name={name}
                type="date"
                defaultValue={value ?? ''}
                className="h-11 rounded-[0.8rem] border border-app-border bg-app-surface-muted px-3 text-sm font-semibold text-app-ink"
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
            <span className="text-[10px] font-semibold tracking-[0.18em] text-app-muted uppercase">
                {label}
            </span>
            {children}
        </label>
    );
}

function MiniReportGroup({
    title,
    values,
}: {
    title: string;
    values: Record<string, number>;
}) {
    const total = Object.values(values).reduce((sum, value) => sum + value, 0);

    return (
        <div className="app-panel-muted min-w-0 p-4">
            <p className="truncate text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                {title}
            </p>
            <p className="mt-2 text-2xl font-semibold text-app-ink tabular-nums">
                {total}
            </p>
            <p className="mt-1 text-xs text-app-muted">
                {Object.keys(values).length} metrics
            </p>
        </div>
    );
}

function CommandCard({
    label,
    value,
    detail,
    icon: Icon,
    tone,
    meter,
    href,
}: {
    label: string;
    value: number;
    detail: string;
    icon: ComponentType<{ className?: string }>;
    tone: 'teal' | 'brass' | 'ink' | 'red';
    meter: number;
    href: RouteDefinition<'get'>;
}) {
    const tones = {
        teal: 'bg-app-teal text-white dark:bg-app-teal dark:text-[#0c0a12]',
        brass: 'bg-app-brass text-[#1c1826]',
        ink: 'bg-[#1c1826] text-white dark:bg-app-brass dark:text-[#1c1826]',
        red: 'bg-app-red text-white',
    };

    return (
        <Link
            href={href}
            className="app-panel group block overflow-hidden p-5 transition duration-300 hover:-translate-y-1"
        >
            <div className="flex items-start justify-between gap-4">
                <div
                    className={`grid size-12 place-items-center rounded-[0.9rem] ${tones[tone]}`}
                >
                    <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-5 text-app-muted transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-app-red" />
            </div>
            <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-app-ink tabular-nums">
                {value}
            </p>
            <p className="mt-2 text-sm leading-6 text-app-muted">{detail}</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-app-surface-muted">
                <div
                    className={`h-full rounded-full ${tones[tone]}`}
                    style={{ width: `${meter}%` }}
                />
            </div>
        </Link>
    );
}

function TriageLink({
    label,
    value,
    detail,
    href,
    alert,
}: {
    label: string;
    value: number;
    detail: string;
    href: RouteDefinition<'get'>;
    alert: boolean;
}) {
    return (
        <Link
            href={href}
            className="group hover:bg-app-surface-strong flex items-center justify-between gap-4 rounded-[1rem] border border-app-border bg-app-surface px-4 py-3 shadow-[0_14px_36px_rgba(17,24,19,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-app-red/35 dark:shadow-none"
        >
            <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.16em] text-app-muted uppercase">
                    {label}
                </p>
                <p className="mt-1 truncate text-sm text-app-muted">{detail}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <span
                    className={`grid min-w-10 place-items-center rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${
                        alert ? 'bg-app-red text-white' : 'theme-primary-active'
                    }`}
                >
                    {value}
                </span>
                <ArrowUpRight className="size-4 text-app-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-app-red" />
            </div>
        </Link>
    );
}

function StatusPlate({
    label,
    value,
    icon: Icon,
    alert = false,
}: {
    label: string;
    value: number | string;
    icon: ComponentType<{ className?: string }>;
    alert?: boolean;
}) {
    return (
        <div className="rounded-[1rem] border border-white/12 bg-white/8 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-white/66 uppercase">
                    {label}
                </p>
                <Icon
                    className={
                        alert ? 'size-5 text-app-brass' : 'size-5 text-white/70'
                    }
                />
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                {value}
            </p>
        </div>
    );
}

function SignalCard({
    label,
    value,
    detail,
    icon: Icon,
}: {
    label: string;
    value: number;
    detail: string;
    icon: ComponentType<{ className?: string }>;
}) {
    return (
        <article className="app-panel p-5">
            <span className="theme-ink-soft grid size-10 place-items-center rounded-full text-app-red">
                <Icon className="size-5" />
            </span>
            <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-app-ink tabular-nums">
                {value}
            </p>
            <p className="mt-1 text-sm leading-6 text-app-muted">{detail}</p>
        </article>
    );
}

function Panel({
    title,
    eyebrow,
    icon: Icon,
    children,
}: {
    title: string;
    eyebrow: string;
    icon: ComponentType<{ className?: string }>;
    children: ReactNode;
}) {
    return (
        <section className="app-panel overflow-hidden">
            <header className="flex items-center justify-between gap-4 border-b border-app-border p-5">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-app-red uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-app-ink">
                        {title}
                    </h2>
                </div>
                <div className="theme-primary-active grid size-10 place-items-center rounded-full">
                    <Icon className="size-5" />
                </div>
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

function WarningRow({ item }: { item: DashboardWarning }) {
    const severity =
        item.severity === 'high'
            ? 'bg-app-red text-white'
            : item.severity === 'medium'
              ? 'bg-app-brass text-[#1c1826]'
              : 'bg-app-teal text-white dark:text-[#0c0a12]';

    return (
        <div className="app-panel-muted p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="leading-tight font-semibold text-app-ink">
                        {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-app-muted">
                        {item.description}
                    </p>
                </div>
                <span
                    className={`${severity} rounded-full px-2.5 py-1 text-xs font-semibold`}
                >
                    {item.count ?? '!'}
                </span>
            </div>
        </div>
    );
}

function ContentRow({ item }: { item: ContentReadinessItem }) {
    return (
        <div className="app-panel-muted p-4">
            <div className="flex items-center gap-2">
                {item.ready ? (
                    <CheckCircle2 className="size-4 text-app-teal dark:text-app-brass" />
                ) : (
                    <span className="size-2 rounded-full bg-app-brass" />
                )}
                <p className="font-semibold text-app-ink">{item.title}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-app-muted">
                {item.description}
            </p>
        </div>
    );
}

function ActivityRow({ item }: { item: ActivityItem }) {
    return (
        <div className="rounded-[1rem] border border-app-border bg-app-surface-muted p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="leading-tight font-semibold text-app-ink">
                        {item.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-app-muted">
                        {item.description ?? 'System activity'}
                    </p>
                </div>
                <span className="shrink-0 text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                    {formatActivityDate(item.created_at)}
                </span>
            </div>
            <p className="mt-3 text-xs font-semibold tracking-[0.14em] text-app-red uppercase">
                {item.actor?.name ?? 'System'}
                {item.subject ? ` / ${item.subject.label}` : ''}
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
        <div className="grid min-h-52 place-items-center rounded-[1rem] border border-dashed border-app-border text-center">
            <div>
                <Icon className="mx-auto mb-4 size-8 text-app-teal dark:text-app-brass" />
                <p className="font-semibold text-app-ink">{title}</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-app-muted">
                    {description}
                </p>
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

function titleCase(value: string) {
    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
