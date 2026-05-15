import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Bell, CalendarDays, FileText, Users, Vote } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    PublicContentCard,
    PublicContentCardSkeleton,
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
    return (
        <>
            <Head>
                <title>Knutsford SRC</title>
                <meta
                    name="description"
                    content="Public announcements, events, documents, executives, and elections from the Knutsford SRC."
                />
            </Head>

            {/* ── Page header ──────────────────────────────────────────── */}
            <section className="border-b bg-muted/30">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                        Knutsford University
                    </p>
                    <h1 className="max-w-xl text-2xl font-bold tracking-tight md:text-3xl">
                        Student Representative Council
                    </h1>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Official announcements, upcoming events, public documents, and student leadership — all in one place.
                    </p>

                    {/* Stats strip */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        {[
                            { icon: <Bell className="size-3.5" />, label: 'Announcements', value: announcements.length },
                            { icon: <CalendarDays className="size-3.5" />, label: 'Events', value: events.length },
                            { icon: <FileText className="size-3.5" />, label: 'Documents', value: documents.length },
                            { icon: <Vote className="size-3.5" />, label: 'Elections', value: elections.length },
                            { icon: <Users className="size-3.5" />, label: 'Executives', value: executives.length },
                        ].map(({ icon, label, value }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 rounded border bg-card px-3 py-1.5"
                            >
                                <span className="text-muted-foreground">{icon}</span>
                                <span className="text-xs text-muted-foreground">{label}</span>
                                <span className="text-xs font-bold">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Content sections ─────────────────────────────────────── */}
            <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 md:px-6">

                {/* Announcements */}
                <Section
                    title="Latest Announcements"
                    icon={<Bell className="size-4" />}
                    href="/announcements"
                    empty={announcements.length === 0}
                    emptyMessage="No announcements have been published yet."
                    emptyIcon={<Bell className="size-8" />}
                >
                    {announcements.map((a) => (
                        <PublicContentCard
                            key={a.id}
                            title={a.title}
                            description={a.excerpt}
                            imageUrl={a.image_url}
                            meta={formatDate(a.published_at)}
                            category={a.category}
                            href={announcementShow(a.slug)}
                        />
                    ))}
                </Section>

                {/* Events */}
                <Section
                    title="Upcoming Events"
                    icon={<CalendarDays className="size-4" />}
                    href="/events/public"
                    empty={events.length === 0}
                    emptyMessage="No upcoming events are listed."
                    emptyIcon={<CalendarDays className="size-8" />}
                >
                    {events.map((e) => (
                        <PublicContentCard
                            key={e.id}
                            title={e.title}
                            description={e.excerpt}
                            imageUrl={e.image_url}
                            meta={[formatDate(e.starts_at), e.location].filter(Boolean).join(' · ')}
                            category={e.category}
                            href={eventShow(e.slug)}
                        />
                    ))}
                </Section>

                {/* SRC Leadership — only show if there are executives */}
                {executives.length > 0 && (
                    <section>
                        <SectionHeader
                            title="SRC Leadership"
                            icon={<Users className="size-4" />}
                            href="/executives/public"
                        />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {executives.map((executive) => (
                                <div
                                    key={executive.id}
                                    className="flex items-center gap-3 rounded-md border bg-card p-3"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
                                        {executive.avatar_url ? (
                                            <img
                                                src={executive.avatar_url}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-muted-foreground">
                                                {executive.name?.slice(0, 1) ?? 'E'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold leading-snug">
                                            {executive.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {executive.position}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Documents */}
                <Section
                    title="Public Documents"
                    icon={<FileText className="size-4" />}
                    href="/documents/public"
                    empty={documents.length === 0}
                    emptyMessage="No documents have been published yet."
                    emptyIcon={<FileText className="size-8" />}
                >
                    {documents.map((d) => (
                        <PublicContentCard
                            key={d.id}
                            title={d.title}
                            description={d.excerpt}
                            imageUrl={d.image_url}
                            meta={formatDate(d.published_at)}
                            category={d.category}
                            href={documentShow(d.slug)}
                        />
                    ))}
                </Section>

                {/* Elections */}
                <Section
                    title="Elections"
                    icon={<Vote className="size-4" />}
                    href="/elections/public"
                    empty={elections.length === 0}
                    emptyMessage="No elections are currently listed."
                    emptyIcon={<Vote className="size-8" />}
                >
                    {elections.map((el) => (
                        <PublicContentCard
                            key={el.id}
                            title={el.title}
                            description={el.description}
                            meta={el.academic_period.name}
                            category={el.status}
                            href={electionShow(el.slug)}
                        />
                    ))}
                </Section>
            </div>
        </>
    );
}

// ── Helper components ──────────────────────────────────────────────────────

function Section({
    title,
    icon,
    href,
    empty,
    emptyMessage,
    emptyIcon,
    children,
}: {
    title: string;
    icon: ReactNode;
    href: string;
    empty: boolean;
    emptyMessage: string;
    emptyIcon?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section>
            <SectionHeader title={title} icon={icon} href={href} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {empty ? (
                    <PublicContentEmpty icon={emptyIcon} message={emptyMessage} />
                ) : (
                    children
                )}
            </div>
        </section>
    );
}

function SectionHeader({
    title,
    icon,
    href,
}: {
    title: string;
    icon: ReactNode;
    href: string;
}) {
    return (
        <div className="mb-4 flex items-center justify-between gap-4 border-b pb-3">
            <div className="flex items-center gap-2">
                <span className="text-primary">{icon}</span>
                <h2 className="text-base font-bold">{title}</h2>
            </div>
            <Link
                href={href}
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
                View all <ArrowRight className="size-3" />
            </Link>
        </div>
    );
}

function formatDate(value: string | null) {
    return value
        ? new Date(value).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : null;
}
