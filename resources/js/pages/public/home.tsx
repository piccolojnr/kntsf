import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { PublicContentCard } from '@/features/public/content-card';
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

            <section className="border-b bg-muted/20">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-[1fr_22rem]">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Knutsford SRC Public Portal
                        </p>
                        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal md:text-5xl">
                            Campus updates, events, documents, and student
                            leadership information.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                            Read official SRC announcements and public resources
                            without entering the dashboard workspace.
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-5">
                        <p className="text-sm font-semibold">At a glance</p>
                        <div className="mt-4 grid gap-3">
                            <Metric label="Announcements" value={announcements.length} />
                            <Metric label="Upcoming events" value={events.length} />
                            <Metric label="Public documents" value={documents.length} />
                            <Metric label="Elections" value={elections.length} />
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 md:px-6">
                <Section title="Featured announcements" href="/announcements">
                    {announcements.map((announcement) => (
                        <PublicContentCard
                            key={announcement.id}
                            title={announcement.title}
                            description={announcement.excerpt}
                            imageUrl={announcement.image_url}
                            meta={formatDate(announcement.published_at)}
                            href={announcementShow(announcement.slug)}
                        />
                    ))}
                </Section>

                <Section title="Upcoming events" href="/events/public">
                    {events.map((event) => (
                        <PublicContentCard
                            key={event.id}
                            title={event.title}
                            description={event.excerpt}
                            imageUrl={event.image_url}
                            meta={[formatDate(event.starts_at), event.location]
                                .filter(Boolean)
                                .join(' · ')}
                            href={eventShow(event.slug)}
                        />
                    ))}
                </Section>

                <Section title="Featured documents" href="/documents/public">
                    {documents.map((document) => (
                        <PublicContentCard
                            key={document.id}
                            title={document.title}
                            description={document.excerpt}
                            imageUrl={document.image_url}
                            meta={document.category}
                            href={documentShow(document.slug)}
                        />
                    ))}
                </Section>

                <section>
                    <SectionHeader title="Executive highlights" href="/executives/public" />
                    <div className="grid gap-4 md:grid-cols-4">
                        {executives.map((executive) => (
                            <div key={executive.id} className="rounded-lg border bg-card p-4">
                                <div className="mb-3 flex size-14 items-center justify-center overflow-hidden rounded-md bg-muted">
                                    {executive.avatar_url ? (
                                        <img
                                            src={executive.avatar_url}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-semibold">
                                            {executive.name?.slice(0, 1) ?? 'E'}
                                        </span>
                                    )}
                                </div>
                                <p className="font-medium">{executive.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {executive.position}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <Section title="Election information" href="/elections/public">
                    {elections.map((election) => (
                        <PublicContentCard
                            key={election.id}
                            title={election.title}
                            description={election.description}
                            meta={`${election.academic_period.name} · ${election.status}`}
                            href={electionShow(election.slug)}
                        />
                    ))}
                </Section>
            </div>
        </>
    );
}

function Section({
    title,
    href,
    children,
}: {
    title: string;
    href: string;
    children: ReactNode;
}) {
    return (
        <section>
            <SectionHeader title={title} href={href} />
            <div className="grid gap-4 md:grid-cols-3">{children}</div>
        </section>
    );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
    return (
        <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button asChild variant="outline" size="sm">
                <Link href={href}>
                    View all
                    <ArrowRight />
                </Link>
            </Button>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-md border bg-background p-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-lg font-semibold">{value}</span>
        </div>
    );
}

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleDateString() : null;
}
