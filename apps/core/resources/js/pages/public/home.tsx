import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    CalendarDays,
    FileText,
    Landmark,
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
                <title>Knutsford SRC</title>
                <meta
                    name="description"
                    content="Public announcements, events, documents, executives, and elections from the Knutsford SRC."
                />
            </Head>

            <section className="relative overflow-hidden border-b border-[#1f2a24]/10 bg-[#efe3c6] dark:border-white/10 dark:bg-[#111712]">
                <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,#17211b_1px,transparent_1px),linear-gradient(#17211b_1px,transparent_1px)] [background-size:44px_44px]" />
                <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-end gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="pb-6">
                        <p className="inline-flex items-center gap-2 border border-[#17211b]/15 bg-[#fffaf0] px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#b7352d] dark:border-white/10 dark:bg-[#0b100d]">
                            <Landmark className="size-4" />
                            Knutsford University
                        </p>
                        <h1 className="mt-7 max-w-4xl text-6xl font-black leading-[0.88] tracking-normal text-[#17211b] dark:text-[#f5ead2] md:text-8xl">
                            SRC public record.
                        </h1>
                        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#596257] dark:text-[#b8c3b8]">
                            Official notices, campus programmes, public documents,
                            leadership profiles, and election information in one
                            civic portal built for students.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <PortalLink href="/announcements" label="Read updates" />
                            <PortalLink href="/events/public" label="Find events" variant="light" />
                        </div>
                    </div>

                    <div className="pb-6">
                        <div className="border border-[#17211b] bg-[#17211b] p-5 text-[#f5ead2] shadow-[14px_14px_0_#d8a329]">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d8a329]">
                                Portal count
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-px bg-[#f5ead2]/15">
                                <Metric icon={<Bell />} label="Announcements" value={announcementItems.length} />
                                <Metric icon={<CalendarDays />} label="Events" value={eventItems.length} />
                                <Metric icon={<FileText />} label="Documents" value={documentItems.length} />
                                <Metric icon={<Vote />} label="Elections" value={electionItems.length} />
                            </div>
                            <div className="mt-6 border-t border-[#f5ead2]/15 pt-5">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d8a329]">
                                    Featured notice
                                </p>
                                <p className="mt-3 text-2xl font-black leading-tight">
                                    {featured?.title ?? 'No featured announcement yet'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto w-full max-w-7xl space-y-20 px-5 py-16 md:px-8">
                <PublicSection
                    title="Latest announcements"
                    kicker="Bulletin"
                    href="/announcements"
                    empty={announcementItems.length === 0}
                    emptyMessage="No announcements have been published yet."
                    emptyIcon={<Bell className="size-8" />}
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
                    emptyIcon={<CalendarDays className="size-8" />}
                >
                    {eventItems.map((event) => (
                        <PublicContentCard
                            key={event.id}
                            title={event.title}
                            description={event.excerpt}
                            imageUrl={event.image_url}
                            meta={[formatPublicDate(event.starts_at), event.location]
                                .filter(Boolean)
                                .join(' / ')}
                            category={event.category}
                            href={eventShow(event.slug)}
                            tone="gold"
                        />
                    ))}
                </PublicSection>

                {executiveItems.length > 0 && (
                    <section className="border-y border-[#1f2a24]/10 py-12 dark:border-white/10">
                        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b7352d]">
                                    Leadership
                                </p>
                                <h2 className="mt-2 text-4xl font-black tracking-normal">
                                    SRC executives
                                </h2>
                            </div>
                            <Link
                                href="/executives/public"
                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0f5b45] dark:text-[#d8a329]"
                            >
                                View all
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {executiveItems.map((executive) => (
                                <article
                                    key={executive.id}
                                    className="border border-[#1f2a24]/10 bg-[#fffaf0] p-4 dark:border-white/10 dark:bg-[#111712]"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar executive={executive} />
                                        <div className="min-w-0">
                                            <p className="truncate font-black">
                                                {executive.name}
                                            </p>
                                            <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-[#b7352d]">
                                                {executive.position}
                                            </p>
                                        </div>
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
                    emptyIcon={<FileText className="size-8" />}
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
                    emptyIcon={<Vote className="size-8" />}
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
            className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                variant === 'dark'
                    ? 'bg-[#17211b] text-[#f5ead2] hover:bg-[#b7352d]'
                    : 'border border-[#17211b]/20 bg-[#fffaf0] text-[#17211b] hover:border-[#b7352d] dark:border-white/10 dark:bg-[#111712] dark:text-[#f5ead2]'
            }`}
        >
            {label}
            <ArrowRight className="size-4" />
        </Link>
    );
}

function Metric({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="bg-[#17211b] p-4">
            <div className="mb-4 text-[#d8a329] [&_svg]:size-5">{icon}</div>
            <p className="text-4xl font-black">{value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#c9c0aa]">
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
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b7352d]">
                        {kicker}
                    </p>
                    <h2 className="mt-2 text-4xl font-black leading-none tracking-normal md:text-5xl">
                        {title}
                    </h2>
                </div>
                <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0f5b45] dark:text-[#d8a329]"
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
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden border border-[#1f2a24]/15 bg-[#efe3c6] dark:border-white/10 dark:bg-[#1b241d]">
            {executive.avatar_url ? (
                <img
                    src={executive.avatar_url}
                    alt=""
                    className="size-full object-cover"
                />
            ) : (
                <Users className="size-6 text-[#0f5b45] dark:text-[#d8a329]" />
            )}
        </div>
    );
}
