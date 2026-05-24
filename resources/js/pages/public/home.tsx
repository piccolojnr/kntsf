import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    CalendarDays,
    FileText,
    Sparkles,
    Users,
    Vote,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    formatPublicDate,
    PublicContentCard,
    PublicContentEmpty,
} from '@/features/public/content-card';
import { show as announcementShow } from '@/routes/public/announcements';
import { show as documentShow } from '@/routes/public/documents';
import { show as electionShow } from '@/routes/public/elections';
import { show as eventShow } from '@/routes/public/events';
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
    const featured = announcementItems[0];

    return (
        <>
            <Head>
                <title>Knutsford SRC — Public Portal</title>
                <meta
                    name="description"
                    content="Official announcements, events, documents, executives, and elections from the Knutsford University Student Representative Council."
                />
            </Head>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-app-border/20 py-20 md:py-28">
                <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
                    {/* Left: headline */}
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-app-border/40 bg-app-surface-muted/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-app-teal dark:border-app-border/30 dark:text-app-brass">
                            <Sparkles className="size-3.5" />
                            Knutsford University SRC
                        </span>

                        <h1 className="mt-7 max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight text-app-ink md:text-6xl lg:text-7xl">
                            Your{' '}
                            <span className="bg-gradient-to-br from-app-teal via-app-teal/80 to-app-teal/60 bg-clip-text text-transparent dark:from-app-brass dark:via-app-brass/80 dark:to-app-brass/60">
                                student voice,
                            </span>{' '}
                            one public record.
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-app-muted">
                            Official notices, campus programmes, public documents,
                            leadership profiles, and election information — all in
                            one civic portal built for you.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <PortalLink href="/announcements" label="Read updates" />
                            <PortalLink href="/events/public" label="Find events" variant="light" />
                        </div>
                    </div>

                    {/* Right: metrics dashboard card */}
                    <div className="relative">
                        {/* Glow behind the card */}
                        <div className="absolute inset-0 -z-10 scale-95 rounded-[2.5rem] bg-app-teal/8 blur-3xl dark:bg-app-brass/8" />

                        <div className="rounded-3xl border border-app-border/30 bg-white/80 p-6 shadow-xl shadow-app-teal/5 backdrop-blur-md dark:border-app-border/20 dark:bg-app-surface/70">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-teal dark:text-app-brass">
                                Portal overview
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <MetricCard
                                    icon={<Bell className="size-4" />}
                                    label="Announcements"
                                    value={announcementItems.length}
                                    color="text-app-red bg-app-red/8 dark:bg-app-red/10"
                                />
                                <MetricCard
                                    icon={<CalendarDays className="size-4" />}
                                    label="Events"
                                    color="text-app-teal bg-app-teal/8 dark:text-app-brass dark:bg-app-brass/10"
                                    value={eventItems.length}
                                />
                                <MetricCard
                                    icon={<FileText className="size-4" />}
                                    label="Documents"
                                    color="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
                                    value={documentItems.length}
                                />
                                <MetricCard
                                    icon={<Vote className="size-4" />}
                                    label="Elections"
                                    color="text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20"
                                    value={electionItems.length}
                                />
                            </div>

                            {featured && (
                                <div className="mt-5 rounded-2xl border border-app-border/30 bg-app-surface-muted/40 p-4 dark:bg-app-surface/40">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-app-teal dark:text-app-brass">
                                        Latest notice
                                    </p>
                                    <p className="mt-2.5 text-sm font-semibold leading-snug text-app-ink line-clamp-3">
                                        {featured.title}
                                    </p>
                                    {featured.published_at && (
                                        <p className="mt-2 text-[11px] font-medium text-app-muted">
                                            {formatPublicDate(featured.published_at)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {!featured && (
                                <div className="mt-5 rounded-2xl border border-dashed border-app-border/30 p-4 text-center">
                                    <p className="text-sm font-medium text-app-muted/60">
                                        No announcements yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content sections */}
            <div className="mx-auto w-full max-w-7xl space-y-20 px-5 py-16 md:px-8">
                <PublicSection
                    title="Latest announcements"
                    kicker="Bulletin"
                    href="/announcements"
                    empty={announcementItems.length === 0}
                    emptyMessage="No announcements have been published yet."
                    emptyIcon={<Bell className="size-7" />}
                >
                    {announcementItems.map((announcement, index) => (
                        <PublicContentCard
                            key={announcement.id}
                            title={announcement.title}
                            description={announcement.excerpt}
                            imageUrl={announcement.image_url}
                            meta={formatPublicDate(announcement.published_at)}
                            category={announcement.category}
                            href={announcementShow(announcement.slug)}
                            tone={index === 0 ? 'red' : 'green'}
                        />
                    ))}
                </PublicSection>

                <PublicSection
                    title="Upcoming events"
                    kicker="Campus calendar"
                    href="/events/public"
                    empty={eventItems.length === 0}
                    emptyMessage="No upcoming events are listed."
                    emptyIcon={<CalendarDays className="size-7" />}
                >
                    {eventItems.map((event) => (
                        <PublicContentCard
                            key={event.id}
                            title={event.title}
                            description={event.excerpt}
                            imageUrl={event.image_url}
                            meta={[formatPublicDate(event.starts_at), event.location]
                                .filter(Boolean)
                                .join(' · ')}
                            category={event.category}
                            href={eventShow(event.slug)}
                            tone="gold"
                        />
                    ))}
                </PublicSection>

                {executiveItems.length > 0 && (
                    <section>
                        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <p className="inline-flex items-center rounded-full bg-app-teal/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-app-teal dark:bg-app-brass/10 dark:text-app-brass">
                                    Leadership
                                </p>
                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-app-ink md:text-4xl">
                                    SRC executives
                                </h2>
                            </div>
                            <Link
                                href="/executives/public"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-app-teal transition-all duration-200 hover:gap-2.5 dark:text-app-brass"
                            >
                                View all
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {executiveItems.map((executive) => (
                                <article
                                    key={executive.id}
                                    className="group flex items-center gap-4 rounded-3xl border border-app-border/30 bg-white/70 p-5 shadow-sm shadow-app-teal/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-app-teal/8 dark:border-app-border/20 dark:bg-app-surface/60"
                                >
                                    <Avatar executive={executive} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-app-ink">
                                            {executive.name}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] font-semibold text-app-teal dark:text-app-brass">
                                            {executive.position}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                <PublicSection
                    title="Public documents"
                    kicker="Downloads"
                    href="/documents/public"
                    empty={documentItems.length === 0}
                    emptyMessage="No documents have been published yet."
                    emptyIcon={<FileText className="size-7" />}
                >
                    {documentItems.map((document) => (
                        <PublicContentCard
                            key={document.id}
                            title={document.title}
                            description={document.excerpt}
                            imageUrl={document.image_url}
                            meta={formatPublicDate(document.published_at)}
                            category={document.category}
                            href={documentShow(document.slug)}
                            tone="ink"
                        />
                    ))}
                </PublicSection>

                <PublicSection
                    title="Elections"
                    kicker="Civic process"
                    href="/elections/public"
                    empty={electionItems.length === 0}
                    emptyMessage="No elections are currently listed."
                    emptyIcon={<Vote className="size-7" />}
                >
                    {electionItems.map((election) => (
                        <PublicContentCard
                            key={election.id}
                            title={election.title}
                            description={election.description}
                            meta={election.academic_period.name}
                            category={election.status}
                            href={electionShow(election.slug)}
                            tone="red"
                        />
                    ))}
                </PublicSection>
            </div>
        </>
    );
}

function normalizeList<T>(value: T[] | Record<string, T> | null | undefined): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        return Object.values(value);
    }

    return [];
}

function PortalLink({
    href,
    label,
    variant = 'dark',
}: {
    href: string;
    label: string;
    variant?: 'dark' | 'light';
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                variant === 'dark'
                    ? 'bg-app-teal text-white shadow-md shadow-app-teal/20 hover:bg-app-teal/90 hover:shadow-lg hover:shadow-app-teal/25 dark:bg-app-brass dark:text-app-ink dark:shadow-app-brass/20 dark:hover:bg-app-brass/90'
                    : 'border border-app-border/40 bg-white/80 text-app-ink backdrop-blur-sm hover:bg-app-surface-muted/60 hover:border-app-border/60 dark:border-app-border/30 dark:bg-app-surface/60 dark:text-app-surface'
            }`}
        >
            {label}
            <ArrowRight className="size-4" />
        </Link>
    );
}

function MetricCard({
    icon,
    label,
    value,
    color,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="rounded-2xl border border-app-border/25 bg-app-surface-muted/30 p-4 dark:border-app-border/15 dark:bg-app-surface/30">
            <div className={`mb-3 inline-flex size-8 items-center justify-center rounded-xl ${color}`}>
                {icon}
            </div>
            <p className="text-2xl font-extrabold text-app-ink">{value}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-app-muted">
                {label}
            </p>
        </div>
    );
}

function PublicSection({
    title,
    kicker,
    href,
    empty,
    emptyMessage,
    emptyIcon,
    children,
}: {
    title: string;
    kicker: string;
    href: string;
    empty: boolean;
    emptyMessage: string;
    emptyIcon: ReactNode;
    children: ReactNode;
}) {
    return (
        <section>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="inline-flex items-center rounded-full bg-app-teal/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-app-teal dark:bg-app-brass/10 dark:text-app-brass">
                        {kicker}
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-app-ink md:text-4xl">
                        {title}
                    </h2>
                </div>
                <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-app-teal transition-all duration-200 hover:gap-2.5 dark:text-app-brass"
                >
                    View all
                    <ArrowRight className="size-4" />
                </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {empty ? (
                    <PublicContentEmpty icon={emptyIcon} message={emptyMessage} />
                ) : (
                    children
                )}
            </div>
        </section>
    );
}

function Avatar({ executive }: { executive: ExecutiveSummary }) {
    return (
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-app-border/30 bg-app-surface-muted/50 transition duration-300 group-hover:scale-105">
            {executive.avatar_url ? (
                <img
                    src={executive.avatar_url}
                    alt=""
                    className="size-full object-cover"
                />
            ) : (
                <Users className="size-5 text-app-teal dark:text-app-brass" />
            )}
        </div>
    );
}
