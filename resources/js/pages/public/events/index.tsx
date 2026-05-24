import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import {
    formatPublicDate,
    PublicContentCard,
    PublicContentEmpty,
    PublicPageHeader,
    PublicPagination,
} from '@/features/public/content-card';
import { show } from '@/routes/public/events';
import type { EventSummary, Paginated } from '../types';

export default function PublicEventsIndex({
    events,
}: {
    events: Paginated<EventSummary>;
}) {
    const items = events.data ?? [];

    return (
        <>
            <Head title="Events" />
            <PublicPageHeader
                eyebrow="Campus Calendar"
                title="Events"
                description="Upcoming campus activities, civic gatherings, and programmes organised by the Student Representative Council."
                count={items.length}
            />
            <section className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.length === 0 ? (
                        <PublicContentEmpty
                            icon={<CalendarDays className="size-8" />}
                            message="No events are currently listed."
                        />
                    ) : (
                        items.map((event) => (
                            <PublicContentCard
                                key={event.id}
                                title={event.title}
                                description={event.excerpt}
                                imageUrl={event.image_url}
                                meta={[formatPublicDate(event.starts_at), event.location]
                                    .filter(Boolean)
                                    .join(' / ')}
                                category={event.category}
                                href={show(event.slug)}
                                tone="gold"
                            />
                        ))
                    )}
                </div>
                <PublicPagination links={events.links} />
            </section>
        </>
    );
}
