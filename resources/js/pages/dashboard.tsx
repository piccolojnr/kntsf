import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BadgeCheck,
    CreditCard,
    Crown,
    IdCard,
    Landmark,
    Newspaper,
    Radar,
    ShieldCheck,
    Users,
    Wifi,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
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
    active_elections: number;
    pending_candidates: number;
    election_votes_today: number;
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
    const permitPressure =
        summary.active_permits +
        summary.expired_permits +
        summary.revoked_permits;

    const commandCards = [
        {
            label: 'Student registry',
            value: summary.total_students,
            detail: `${activationRate}% activated`,
            icon: Users,
            tone: 'emerald',
            meter: activationRate,
        },
        {
            label: 'Active permits',
            value: summary.active_permits,
            detail: `${summary.expired_permits} expired / ${summary.revoked_permits} revoked`,
            icon: IdCard,
            tone: 'amber',
            meter: percent(summary.active_permits, permitPressure),
        },
        {
            label: 'NFC coverage',
            value: summary.active_nfc_cards,
            detail: 'Active cards assigned',
            icon: Wifi,
            tone: 'cyan',
            meter: percent(summary.active_nfc_cards, summary.total_students),
        },
        {
            label: 'Payment confirmations',
            value: summary.successful_payments,
            detail: `${summary.pending_payments} pending`,
            icon: CreditCard,
            tone: 'rose',
            meter: percent(
                summary.successful_payments,
                summary.successful_payments + summary.pending_payments,
            ),
        },
    ] as const;

    return (
        <>
            <Head title="Dashboard" />
            <div className="app-page p-4 md:p-6">
                <section className="relative overflow-hidden rounded-md border border-app-border bg-app-ink text-app-surface shadow-[0_24px_80px_rgba(17,24,19,0.18)] dark:shadow-none">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#f5ead2_1px,transparent_1px),linear-gradient(#f5ead2_1px,transparent_1px)] bg-size-[36px_36px] opacity-[0.08]" />
                    <div className="relative grid gap-8 p-6 lg:grid-cols-[1fr_22rem] lg:p-8">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-md bg-app-brass px-3 py-1.5 text-xs font-black tracking-[0.22em] text-app-ink uppercase">
                                <Landmark className="size-4" />
                                SRC control room
                            </p>
                            <h1 className="mt-6 max-w-4xl text-5xl leading-[0.92] font-black tracking-normal md:text-7xl">
                                Operations overview
                            </h1>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-app-surface/75">
                                Live working summary for student records,
                                permits, NFC cards, payments, verification,
                                content, and elections.
                            </p>
                        </div>
                        <div className="grid content-end gap-3">
                            <StatusPlate
                                label="Operational warnings"
                                value={warnings.length}
                                icon={AlertTriangle}
                                alert={warnings.length > 0}
                            />
                            <StatusPlate
                                label="Verification success"
                                value={`${verificationSuccessRate}%`}
                                icon={ShieldCheck}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {commandCards.map((card) => (
                        <CommandCard key={card.label} {...card} />
                    ))}
                </section>

                <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
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
            </div>
        </>
    );
}

function CommandCard({
    label,
    value,
    detail,
    icon: Icon,
    tone,
    meter,
}: {
    label: string;
    value: number;
    detail: string;
    icon: ComponentType<{ className?: string }>;
    tone: 'emerald' | 'amber' | 'cyan' | 'rose';
    meter: number;
}) {
    const tones = {
        emerald: 'bg-app-teal text-white',
        amber: 'bg-app-brass text-app-ink',
        cyan: 'bg-app-ink text-app-surface',
        rose: 'bg-app-red text-white',
    };

    return (
        <article className="app-panel group p-5 transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-4">
                <div
                    className={`grid size-12 place-items-center rounded-md ${tones[tone]}`}
                >
                    <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-5 text-app-muted transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <p className="mt-6 text-xs font-black tracking-[0.18em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-2 text-4xl font-black tabular-nums">{value}</p>
            <p className="mt-2 text-sm font-semibold text-app-muted">
                {detail}
            </p>
            <div className="mt-5 h-2 rounded-full bg-app-surface-muted">
                <div
                    className={`h-full rounded-full ${tones[tone]}`}
                    style={{ width: `${meter}%` }}
                />
            </div>
        </article>
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
        <div className="rounded-md border border-app-surface/15 bg-black/20 p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-black tracking-[0.22em] text-app-surface/75 uppercase">
                    {label}
                </p>
                <Icon
                    className={
                        alert ? 'size-5 text-app-brass' : 'size-5 text-app-teal'
                    }
                />
            </div>
            <p className="mt-3 text-4xl font-black">{value}</p>
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
            <Icon className="size-5 text-app-red" />
            <p className="mt-5 text-xs font-black tracking-[0.18em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-semibold text-app-muted">
                {detail}
            </p>
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
        <section className="app-panel">
            <header className="flex items-center justify-between border-b border-app-border p-5">
                <div>
                    <p className="text-[10px] font-black tracking-[0.24em] text-app-red uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-normal">
                        {title}
                    </h2>
                </div>
                <div className="grid size-10 place-items-center rounded-md bg-app-ink text-app-surface dark:bg-app-surface dark:text-app-ink">
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
            ? 'bg-app-red'
            : item.severity === 'medium'
              ? 'bg-app-brass text-app-ink'
              : 'bg-app-teal';

    return (
        <div className="app-panel-muted p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="leading-tight font-black">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-app-muted">
                        {item.description}
                    </p>
                </div>
                <span
                    className={`${severity} px-2 py-1 text-xs font-black text-white`}
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
                <span
                    className={
                        item.ready
                            ? 'size-2 rounded-full bg-app-teal'
                            : 'size-2 rounded-full bg-app-brass'
                    }
                />
                <p className="font-black">{item.title}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-app-muted">
                {item.description}
            </p>
        </div>
    );
}

function ActivityRow({ item }: { item: ActivityItem }) {
    return (
        <div className="rounded-md border-app-teal bg-app-surface-muted p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="leading-tight font-black">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-app-muted">
                        {item.description ?? 'System activity'}
                    </p>
                </div>
                <span className="shrink-0 text-xs font-black tracking-[0.14em] text-app-muted uppercase">
                    {formatActivityDate(item.created_at)}
                </span>
            </div>
            <p className="mt-3 text-xs font-black tracking-[0.14em] text-app-red uppercase">
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
        <div className="grid min-h-52 place-items-center rounded-md border border-dashed border-app-border text-center">
            <div>
                <Icon className="mx-auto mb-4 size-8 text-app-teal dark:text-app-brass" />
                <p className="font-black">{title}</p>
                <p className="mt-2 max-w-sm text-sm text-app-muted">
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
