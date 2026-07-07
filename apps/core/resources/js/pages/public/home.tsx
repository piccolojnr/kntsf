import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    CalendarDays,
    FileText,
    IdCard,
    Users,
    Vote,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { formatPublicDate } from '@/features/public/content-card';
import {
    index as announcementsIndex,
    show as announcementShow,
} from '@/routes/public/announcements';
import {
    index as documentsIndex,
    show as documentShow,
} from '@/routes/public/documents';
import {
    index as electionsIndex,
    show as electionShow,
} from '@/routes/public/elections';
import {
    index as eventsIndex,
    show as eventShow,
} from '@/routes/public/events';
import { index as executivesIndex } from '@/routes/public/executives';
import { index as permitRequestIndex } from '@/routes/public/permit-request';
import type { RouteDefinition } from '@/wayfinder';
import type {
    AnnouncementSummary,
    DocumentSummary,
    ElectionSummary,
    EventSummary,
    ExecutiveSummary,
} from './types';

export default function PublicHome({
    announcements,
    events,
    documents,
    executives,
    elections,
}: {
    announcements: AnnouncementSummary[];
    events: EventSummary[];
    documents: DocumentSummary[];
    executives: ExecutiveSummary[];
    elections: ElectionSummary[];
}) {
    const announcementItems = normalizeList(announcements);
    const eventItems = normalizeList(events);
    const documentItems = normalizeList(documents);
    const executiveItems = normalizeList(executives);
    const electionItems = normalizeList(elections);
    const featuredNotice = announcementItems[0];
    const secondaryNotices = announcementItems.slice(1, 4);

    return (
        <>
            <Head>
                <title>Knutsford SRC - Public Portal</title>
                <meta
                    name="description"
                    content="Official announcements, events, documents, executives, and elections from the Knutsford University Student Representative Council."
                />
            </Head>

            <section className="theme-ink-panel relative min-h-screen overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center lg:bg-[center_left]"
                    style={{
                        backgroundImage: "url('/images/campus-hero.jpg')",
                    }}
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,10,18,0.7)_0%,rgba(12,10,18,0.42)_42%,rgba(12,10,18,0.1)_100%)] lg:bg-[linear-gradient(90deg,rgba(12,10,18,0.66)_0%,rgba(12,10,18,0.34)_34%,rgba(12,10,18,0.08)_72%,rgba(12,10,18,0.22)_100%)]"
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#1c1826]/72 to-transparent"
                    aria-hidden="true"
                />

                <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 pt-24 pb-16 md:px-8 md:pt-28">
                    <div className="public-reveal relative max-w-xl">
                        <div
                            className="absolute top-1 -left-4 hidden h-full w-px bg-gradient-to-b from-white/70 via-white/24 to-transparent md:block"
                            aria-hidden="true"
                        />
                        <p className="text-xs font-semibold tracking-[0.24em] text-white/70 uppercase">
                            Knutsford SRC
                        </p>
                        <div className="relative mt-5">
                            <p className="public-hand absolute -top-6 right-2 hidden rotate-[-7deg] text-lg text-white/72 md:block">
                                for students
                            </p>
                            <h1 className="relative text-4xl leading-[1.02] font-semibold tracking-[-0.035em] text-white md:text-6xl">
                                Clear campus information, all in one place.
                            </h1>
                            <span
                                className="theme-surface-strong mt-4 block h-1.5 w-44 rounded-full [clip-path:polygon(0_45%,18%_30%,38%_58%,58%_36%,78%_54%,100%_40%,100%_76%,0_84%)]"
                                aria-hidden="true"
                            />
                        </div>
                        <p className="mt-5 max-w-md text-base leading-8 text-white/76 md:text-lg">
                            Notices, services, events, documents, elections, and
                            SRC leadership records for students.
                        </p>
                        <div className="mt-8 inline-flex flex-wrap gap-2 rounded-full border border-white/14 bg-black/12 p-1.5 backdrop-blur-md">
                            <HeroAction
                                href={announcementsIndex()}
                                label="View notices"
                            />
                            <HeroAction
                                href={permitRequestIndex()}
                                label="Request permit"
                                variant="secondary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="theme-paper relative overflow-hidden border-b border-app-border/80">
                <div
                    className="public-notebook-grid pointer-events-none absolute inset-0 opacity-45"
                    aria-hidden="true"
                />
                <div
                    className="public-float pointer-events-none absolute -top-12 right-[12%] size-36 rounded-full border border-dashed border-app-ink/10"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute bottom-8 left-[7%] h-12 w-36 rotate-[-4deg] rounded-full bg-app-brass/18 blur-2xl"
                    aria-hidden="true"
                />
                <div className="public-rise relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 md:px-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
                    <SectionIntro
                        eyebrow="Public desk"
                        title="Start with what matters"
                        description="Fast paths into the notices, services, and records students check most."
                    />

                    <div className="grid gap-5 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1fr)]">
                        <LatestNotice
                            notice={featuredNotice}
                            noticeCount={secondaryNotices.length}
                        />

                        <div className="theme-surface-strong grid overflow-hidden rounded-[1.4rem] border border-app-border shadow-[0_18px_55px_rgba(28,24,38,0.06)] sm:grid-cols-2 lg:grid-cols-4">
                            <ServiceLink
                                href={announcementsIndex()}
                                icon={<Bell />}
                                label="Updates"
                                description={`${announcementItems.length} public notice${announcementItems.length === 1 ? '' : 's'}`}
                            />
                            <ServiceLink
                                href={eventsIndex()}
                                icon={<CalendarDays />}
                                label="Events"
                                description={`${eventItems.length} upcoming`}
                            />
                            <ServiceLink
                                href={documentsIndex()}
                                icon={<FileText />}
                                label="Documents"
                                description={`${documentItems.length} published`}
                            />
                            <ServiceLink
                                href={permitRequestIndex()}
                                icon={<IdCard />}
                                label="Permit"
                                description="Start or check request"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="public-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-18 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
                <SectionIntro
                    eyebrow="At a glance"
                    title="What is active now"
                    description="A compact overview of public activity across the council."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatPill
                        label="Announcements"
                        value={announcementItems.length}
                    />
                    <StatPill label="Events" value={eventItems.length} />
                    <StatPill label="Documents" value={documentItems.length} />
                    <StatPill label="Elections" value={electionItems.length} />
                </div>
            </section>

            <section className="theme-surface relative overflow-hidden border-y border-app-border/80 dark:bg-app-surface/30">
                <div
                    className="pointer-events-none absolute top-10 right-0 h-64 w-64 rounded-full border border-app-red/8"
                    aria-hidden="true"
                />
                <div className="public-rise relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-18 md:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
                    <div className="relative grid gap-6">
                        <SectionIntro
                            eyebrow="Calendar"
                            title="Dates around campus"
                            description="Public activities, meetings, and student moments worth noting."
                            href={eventsIndex()}
                        />
                        <ImagePanel
                            src="/images/campus-moment.jpg"
                            alt="Campus moment"
                            label="Campus moment"
                        />
                    </div>

                    <div className="relative">
                        <p className="public-hand absolute -top-5 right-8 z-10 hidden rotate-[-5deg] text-base text-app-muted md:block">
                            next up
                        </p>
                        <div className="public-sketch-card theme-paper divide-y divide-app-border overflow-hidden rounded-[1.4rem] border border-app-border shadow-[0_18px_55px_rgba(28,24,38,0.06)] dark:bg-app-page">
                            {eventItems.length > 0 ? (
                                eventItems
                                    .slice(0, 5)
                                    .map((event) => (
                                        <EventRow
                                            key={event.id}
                                            event={event}
                                        />
                                    ))
                            ) : (
                                <EmptyLine message="No upcoming events are listed." />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="public-rise mx-auto grid w-full max-w-7xl gap-8 px-5 py-18 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="relative">
                    <p className="public-hand absolute -top-2 right-4 hidden rotate-[5deg] text-base text-app-muted md:block">
                        filed neatly
                    </p>
                    <SectionHeader
                        eyebrow="Records"
                        title="Recent documents"
                        href={documentsIndex()}
                    />
                    <div className="public-sketch-card theme-surface mt-6 divide-y divide-app-border overflow-hidden rounded-[1.4rem] border border-app-border shadow-[0_18px_55px_rgba(28,24,38,0.05)] dark:bg-app-surface/60">
                        {documentItems.length > 0 ? (
                            documentItems
                                .slice(0, 4)
                                .map((document) => (
                                    <DocumentRow
                                        key={document.id}
                                        document={document}
                                    />
                                ))
                        ) : (
                            <EmptyLine message="No documents have been published yet." />
                        )}
                    </div>
                </div>

                <div className="relative">
                    <p className="public-hand absolute -top-2 right-4 hidden rotate-[-4deg] text-base text-app-muted md:block">
                        voting desk
                    </p>
                    <SectionHeader
                        eyebrow="Civic"
                        title="Elections"
                        href={electionsIndex()}
                    />
                    <div className="public-sketch-card theme-surface mt-6 divide-y divide-app-border overflow-hidden rounded-[1.4rem] border border-app-border shadow-[0_18px_55px_rgba(28,24,38,0.05)] dark:bg-app-surface/60">
                        {electionItems.length > 0 ? (
                            electionItems
                                .slice(0, 4)
                                .map((election) => (
                                    <ElectionRow
                                        key={election.id}
                                        election={election}
                                    />
                                ))
                        ) : (
                            <EmptyLine message="No elections are currently listed." />
                        )}
                    </div>
                </div>
            </section>

            {executiveItems.length > 0 && (
                <section className="public-rise mx-auto w-full max-w-7xl px-5 pb-20 md:px-8">
                    <div className="public-sketch-card theme-ink-panel grid overflow-hidden rounded-[1.6rem] border border-app-border shadow-[0_22px_70px_rgba(28,24,38,0.16)] lg:grid-cols-[0.8fr_1.2fr]">
                        <div className="border-b border-white/10 p-6 md:p-8 lg:border-r lg:border-b-0">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.22em] text-white/50 uppercase">
                                    Leadership
                                </p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">
                                    SRC executives
                                </h2>
                                <p className="mt-4 max-w-sm text-sm leading-7 text-white/58">
                                    Names, roles, and public leadership records
                                    for the current student council.
                                </p>
                            </div>
                            <Link
                                href={executivesIndex()}
                                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
                            >
                                View all
                                <ArrowRight className="size-4" />
                            </Link>
                            <ImagePanel
                                src="/images/leadership-photo.jpg"
                                alt="SRC leadership"
                                label="public leadership"
                                dark
                                className="mt-8"
                            />
                        </div>

                        <div className="grid content-start gap-3 p-6 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] md:p-8 lg:pt-10">
                            {executiveItems.slice(0, 4).map((executive) => (
                                <ExecutiveItem
                                    key={executive.id}
                                    executive={executive}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

function normalizeList<T>(
    value: T[] | Record<string, T> | null | undefined,
): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        return Object.values(value);
    }

    return [];
}

function HeroAction({
    href,
    label,
    variant = 'primary',
}: {
    href: RouteDefinition<'get'>;
    label: string;
    variant?: 'primary' | 'secondary';
}) {
    return (
        <Link
            href={href}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 md:px-5 ${
                variant === 'primary'
                    ? 'bg-white text-[#1c1826] shadow-[0_12px_34px_rgba(0,0,0,0.18)] hover:bg-white/88'
                    : 'border border-white/14 bg-white/8 text-white hover:bg-white/14'
            }`}
        >
            {label}
            <ArrowRight className="size-4" />
        </Link>
    );
}

function LatestNotice({
    notice,
    noticeCount,
}: {
    notice?: AnnouncementSummary;
    noticeCount: number;
}) {
    if (!notice) {
        return (
            <div className="public-sketch-card theme-surface rounded-2xl border border-app-border p-5">
                <EmptyLine message="No public notice has been published yet." />
            </div>
        );
    }

    return (
        <Link
            href={announcementShow(notice.slug)}
            className="public-sketch-card group theme-surface flex min-h-full flex-col justify-between rounded-2xl border border-app-border p-5 transition duration-300 hover:border-app-red/35 hover:bg-white dark:hover:bg-app-surface"
        >
            <div>
                <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-app-red uppercase">
                        Latest notice
                    </p>
                    <span className="theme-ink-soft rounded-full px-2.5 py-1 text-[0.68rem] font-semibold text-app-muted">
                        {noticeCount} more
                    </span>
                </div>
                <MetaLine
                    label={formatPublicDate(notice.published_at)}
                    className="mt-5"
                />
                <p className="mt-3 text-xl leading-tight font-semibold tracking-[-0.025em] text-app-ink transition group-hover:text-app-red">
                    {notice.title}
                </p>
                {notice.excerpt && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-app-muted">
                        {notice.excerpt}
                    </p>
                )}
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-app-ink transition group-hover:gap-3 group-hover:text-app-red">
                Open bulletin
                <ArrowRight className="size-4" />
            </span>
        </Link>
    );
}

function ServiceLink({
    href,
    icon,
    label,
    description,
}: {
    href: RouteDefinition<'get'>;
    icon: ReactNode;
    label: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group relative border-b border-app-border p-5 transition duration-300 last:border-b-0 hover:z-10 hover:bg-[#f8f7f3] hover:shadow-[0_18px_50px_rgba(28,24,38,0.08)] sm:odd:border-r lg:border-r lg:border-b-0 lg:last:border-r-0 dark:hover:bg-app-page sm:[&:nth-child(3)]:border-b-0"
        >
            <span className="mb-8 flex size-9 items-center justify-center rounded-full bg-[#1c1826]/6 text-app-muted transition duration-300 group-hover:scale-110 group-hover:rotate-[-7deg] group-hover:bg-[#1c1826] group-hover:text-white dark:bg-white/8 dark:group-hover:bg-app-brass dark:group-hover:text-[#1c1826] [&_svg]:size-4">
                {icon}
            </span>
            <span className="block text-sm font-semibold text-app-ink">
                {label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-app-muted">
                {description}
            </span>
        </Link>
    );
}

function ImagePanel({
    src,
    alt,
    label,
    dark = false,
    className = '',
}: {
    src: string;
    alt: string;
    label: string;
    dark?: boolean;
    className?: string;
}) {
    return (
        <figure
            className={`public-sketch-card group relative min-h-72 overflow-hidden rounded-[1.4rem] border ${
                dark
                    ? 'border-white/12 bg-white/[0.06]'
                    : 'theme-surface border-app-border'
            } ${className}`}
        >
            <img
                src={src}
                alt={alt}
                className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div
                className={`absolute inset-0 ${
                    dark
                        ? 'bg-gradient-to-t from-[#1c1826]/80 via-[#1c1826]/12 to-transparent'
                        : 'bg-gradient-to-t from-[#1c1826]/55 via-[#1c1826]/5 to-transparent'
                }`}
                aria-hidden="true"
            />
            <div
                className="absolute inset-4 rounded-[1.05rem] border border-white/18"
                aria-hidden="true"
            />
            <figcaption className="public-hand theme-surface-strong absolute right-5 bottom-5 rotate-[-3deg] rounded-full px-4 py-2 text-base text-app-ink shadow-[0_14px_40px_rgba(12,10,18,0.16)]">
                <span className="sr-only">{alt}: </span>
                <span aria-hidden="true">{label}</span>
            </figcaption>
        </figure>
    );
}

function MetaLine({
    label,
    className = '',
}: {
    label: string | null;
    className?: string;
}) {
    if (!label) {
        return null;
    }

    return (
        <p
            className={`text-xs font-medium tracking-[0.16em] text-app-muted uppercase ${className}`}
        >
            {label}
        </p>
    );
}

function SectionIntro({
    eyebrow,
    title,
    description,
    href,
}: {
    eyebrow: string;
    title: string;
    description: string;
    href?: RouteDefinition<'get'>;
}) {
    return (
        <div className="relative">
            <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-app-muted">
                {description}
            </p>
            {href && (
                <Link
                    href={href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-app-ink transition hover:gap-3 hover:text-app-red"
                >
                    View all
                    <ArrowRight className="size-4" />
                </Link>
            )}
        </div>
    );
}

function SectionHeader({
    eyebrow,
    title,
    href,
}: {
    eyebrow: string;
    title: string;
    href: RouteDefinition<'get'>;
}) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                    {eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-app-ink">
                    {title}
                </h2>
            </div>
            <Link
                href={href}
                className="inline-flex items-center gap-2 text-sm font-medium text-app-muted transition hover:text-app-red"
            >
                View all
                <ArrowRight className="size-4" />
            </Link>
        </div>
    );
}

function StatPill({ label, value }: { label: string; value: number }) {
    return (
        <div className="public-sketch-card group theme-surface relative overflow-hidden rounded-[1.2rem] border border-app-border p-5 shadow-[0_14px_45px_rgba(28,24,38,0.045)] transition duration-300 hover:-translate-y-1 hover:bg-white dark:hover:bg-app-surface">
            <span
                className="absolute top-4 right-4 h-8 w-8 rounded-full border border-dashed border-app-ink/12"
                aria-hidden="true"
            />
            <p className="text-4xl font-semibold tracking-[-0.04em] text-app-ink">
                {value}
            </p>
            <p className="mt-2 text-xs font-medium tracking-[0.18em] text-app-muted uppercase">
                {label}
            </p>
        </div>
    );
}

function EventRow({ event }: { event: EventSummary }) {
    return (
        <Link
            href={eventShow(event.slug)}
            className="group grid gap-4 p-5 transition duration-300 hover:bg-white md:grid-cols-[8rem_minmax(0,1fr)_auto] md:items-center dark:hover:bg-app-surface"
        >
            <div className="theme-surface rounded-full border border-app-border px-3 py-2 text-center dark:bg-app-surface">
                <MetaLine label={formatPublicDate(event.starts_at)} />
            </div>
            <span>
                <span className="block text-base font-semibold text-app-ink transition group-hover:text-app-red">
                    {event.title}
                </span>
                <span className="mt-1 line-clamp-1 block text-sm text-app-muted">
                    {[event.category, event.location]
                        .filter(Boolean)
                        .join(' / ')}
                </span>
            </span>
            <ArrowRight className="hidden size-4 text-app-muted transition group-hover:translate-x-1 group-hover:text-app-red md:block" />
        </Link>
    );
}

function DocumentRow({ document }: { document: DocumentSummary }) {
    return (
        <Link
            href={documentShow(document.slug)}
            className="group flex items-start justify-between gap-4 p-5 transition duration-300 hover:bg-[#f8f7f3] dark:hover:bg-app-page"
        >
            <span>
                <span className="line-clamp-1 text-sm font-semibold text-app-ink transition group-hover:text-app-red">
                    {document.title}
                </span>
                <span className="mt-2 block text-xs text-app-muted">
                    {[
                        document.category,
                        formatPublicDate(document.published_at),
                    ]
                        .filter(Boolean)
                        .join(' / ')}
                </span>
            </span>
            <FileText className="size-4 shrink-0 text-app-muted transition group-hover:rotate-[-8deg] group-hover:text-app-red" />
        </Link>
    );
}

function ElectionRow({ election }: { election: ElectionSummary }) {
    return (
        <Link
            href={electionShow(election.slug)}
            className="group flex items-start justify-between gap-4 p-5 transition duration-300 hover:bg-[#f8f7f3] dark:hover:bg-app-page"
        >
            <span>
                <span className="line-clamp-1 text-sm font-semibold text-app-ink transition group-hover:text-app-red">
                    {election.title}
                </span>
                <span className="mt-2 block text-xs text-app-muted">
                    {[election.status, election.academic_period.name]
                        .filter(Boolean)
                        .join(' / ')}
                </span>
            </span>
            <Vote className="size-4 shrink-0 text-app-muted transition group-hover:rotate-[8deg] group-hover:text-app-red" />
        </Link>
    );
}

function ExecutiveItem({ executive }: { executive: ExecutiveSummary }) {
    return (
        <article className="group flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/[0.07] p-3 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.1]">
            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white/12">
                {executive.avatar_url ? (
                    <img
                        src={executive.avatar_url}
                        alt=""
                        className="size-full object-cover"
                    />
                ) : (
                    <Users className="size-4 text-white/70" />
                )}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">
                    {executive.name}
                </span>
                <span className="mt-0.5 block truncate text-xs text-white/55">
                    {executive.position}
                </span>
            </span>
        </article>
    );
}

function EmptyLine({ message }: { message: string }) {
    return (
        <div className="relative min-h-56 overflow-hidden p-5">
            <div
                className="public-float absolute top-6 right-7 size-20 rounded-full border border-dashed border-app-ink/12"
                aria-hidden="true"
            />
            <div
                className="absolute right-8 bottom-8 h-20 w-32 rotate-[-8deg] rounded-full bg-app-brass/18 blur-2xl"
                aria-hidden="true"
            />
            <div className="relative flex min-h-46 flex-col justify-between">
                <div className="theme-ink-soft grid size-10 place-items-center rounded-full text-app-muted">
                    <Bell className="size-4" />
                </div>
                <div>
                    <div
                        className="public-empty-lines mb-6 h-20 max-w-sm"
                        aria-hidden="true"
                    />
                    <p className="max-w-sm text-sm leading-7 text-app-muted">
                        {message}
                    </p>
                    <p className="public-hand mt-3 rotate-[-2deg] text-base text-app-muted/80">
                        space reserved
                    </p>
                </div>
            </div>
        </div>
    );
}
