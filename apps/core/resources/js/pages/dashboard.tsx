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
    const verificationSuccessRate = 100 - percent(
        summary.failed_verification_attempts_today,
        summary.verification_attempts_today,
    );
    const permitPressure =
        summary.active_permits + summary.expired_permits + summary.revoked_permits;

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
            <div className="min-h-full bg-[#f5f1e8] p-4 text-[#17211b] dark:bg-[#090e0b] dark:text-[#f5ead2] md:p-6">
                <section className="relative overflow-hidden border border-[#17211b]/10 bg-[#17211b] text-[#f5ead2] shadow-[0_24px_80px_rgba(17,24,19,0.18)] dark:border-white/10">
                    <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,#f5ead2_1px,transparent_1px),linear-gradient(#f5ead2_1px,transparent_1px)] [background-size:36px_36px]" />
                    <div className="relative grid gap-8 p-6 lg:grid-cols-[1fr_22rem] lg:p-8">
                        <div>
                            <p className="inline-flex items-center gap-2 bg-[#d8a329] px-3 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-[#17211b]">
                                <Landmark className="size-4" />
                                SRC control room
                            </p>
                            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-normal md:text-7xl">
                                Operations overview
                            </h1>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#cfc7b4]">
                                Live working summary for student records, permits,
                                NFC cards, payments, verification, content, and
                                elections.
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
                                        <WarningRow key={item.key} item={item} />
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
                                        <ContentRow key={item.key} item={item} />
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
        emerald: 'bg-[#0f5b45]',
        amber: 'bg-[#d8a329]',
        cyan: 'bg-[#1f6b83]',
        rose: 'bg-[#b7352d]',
    };

    return (
        <article className="group border border-[#17211b]/10 bg-[#fffaf0] p-5 shadow-[0_18px_50px_rgba(23,33,27,0.08)] transition hover:-translate-y-1 dark:border-white/10 dark:bg-[#111712]">
            <div className="flex items-start justify-between gap-4">
                <div className={`grid size-12 place-items-center ${tones[tone]} text-white`}>
                    <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-5 text-[#909684] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#596257] dark:text-[#b8c3b8]">
                {label}
            </p>
            <p className="mt-2 text-4xl font-black tabular-nums">{value}</p>
            <p className="mt-2 text-sm font-semibold text-[#596257] dark:text-[#b8c3b8]">
                {detail}
            </p>
            <div className="mt-5 h-2 bg-[#e2dac8] dark:bg-[#1e2a22]">
                <div className={`h-full ${tones[tone]}`} style={{ width: `${meter}%` }} />
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
        <div className="border border-[#f5ead2]/15 bg-[#0e1511]/80 p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#cfc7b4]">
                    {label}
                </p>
                <Icon className={alert ? 'size-5 text-[#d8a329]' : 'size-5 text-[#7fb99f]'} />
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
        <article className="border border-[#17211b]/10 bg-[#fffaf0] p-5 dark:border-white/10 dark:bg-[#111712]">
            <Icon className="size-5 text-[#b7352d]" />
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#596257] dark:text-[#b8c3b8]">
                {label}
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-semibold text-[#596257] dark:text-[#b8c3b8]">
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
        <section className="border border-[#17211b]/10 bg-[#fffaf0] shadow-[0_18px_50px_rgba(23,33,27,0.08)] dark:border-white/10 dark:bg-[#111712]">
            <header className="flex items-center justify-between border-b border-[#17211b]/10 p-5 dark:border-white/10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b7352d]">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-normal">{title}</h2>
                </div>
                <div className="grid size-10 place-items-center bg-[#17211b] text-[#f5ead2] dark:bg-[#f5ead2] dark:text-[#17211b]">
                    <Icon className="size-5" />
                </div>
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

function WarningRow({ item }: { item: DashboardWarning }) {
    const severity = item.severity === 'high' ? 'bg-[#b7352d]' : item.severity === 'medium' ? 'bg-[#d8a329]' : 'bg-[#0f5b45]';

    return (
        <div className="border border-[#17211b]/10 bg-[#f5f1e8] p-4 dark:border-white/10 dark:bg-[#0b100d]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-black leading-tight">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#596257] dark:text-[#b8c3b8]">
                        {item.description}
                    </p>
                </div>
                <span className={`${severity} px-2 py-1 text-xs font-black text-white`}>
                    {item.count ?? '!'}
                </span>
            </div>
        </div>
    );
}

function ContentRow({ item }: { item: ContentReadinessItem }) {
    return (
        <div className="border border-[#17211b]/10 bg-[#f5f1e8] p-4 dark:border-white/10 dark:bg-[#0b100d]">
            <div className="flex items-center gap-2">
                <span className={item.ready ? 'size-2 bg-[#0f5b45]' : 'size-2 bg-[#d8a329]'} />
                <p className="font-black">{item.title}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#596257] dark:text-[#b8c3b8]">
                {item.description}
            </p>
        </div>
    );
}

function ActivityRow({ item }: { item: ActivityItem }) {
    return (
        <div className="border-l-4 border-[#0f5b45] bg-[#f5f1e8] p-4 dark:bg-[#0b100d]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-black leading-tight">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[#596257] dark:text-[#b8c3b8]">
                        {item.description ?? 'System activity'}
                    </p>
                </div>
                <span className="shrink-0 text-xs font-black uppercase tracking-[0.14em] text-[#909684]">
                    {formatActivityDate(item.created_at)}
                </span>
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#b7352d]">
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
        <div className="grid min-h-52 place-items-center border border-dashed border-[#17211b]/20 text-center dark:border-white/15">
            <div>
                <Icon className="mx-auto mb-4 size-8 text-[#0f5b45] dark:text-[#d8a329]" />
                <p className="font-black">{title}</p>
                <p className="mt-2 max-w-sm text-sm text-[#596257] dark:text-[#b8c3b8]">
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
