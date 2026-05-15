import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { PublicContentCard, PublicContentEmpty } from '@/features/public/content-card';
import { show } from '@/routes/public/events';
import type { EventSummary, Paginated } from '../types';

export default function PublicEventsIndex({
    events,
}: {
    events: Paginated<EventSummary>;
}) {
    const items = events.data;

    return (
        <>
            <Head title="Events" />

            {/* Page header */}
            <div className="border-b bg-muted/30">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                        SRC Portal
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Events</h1>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Upcoming campus events, activities, and programmes organised by the Student Representative Council.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                                meta={[formatDate(event.starts_at), event.location]
                                    .filter(Boolean)
                                    .join(' · ')}
                                category={event.category}
                                href={show(event.slug)}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

function formatDate(value: string | null) {
    return value
        ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;
}
