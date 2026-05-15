import { Head } from '@inertiajs/react';
import { PublicContentCard } from '@/features/public/content-card';
import { show } from '@/routes/public/events';
import type { EventSummary, Paginated } from '../types';

export default function PublicEventsIndex({
    events,
}: {
    events: Paginated<EventSummary>;
}) {
    return (
        <>
            <Head title="Events" />
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold">Events</h1>
                    <p className="mt-2 text-muted-foreground">
                        Public SRC and student events.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {events.data.map((event) => (
                        <PublicContentCard
                            key={event.id}
                            title={event.title}
                            description={event.excerpt}
                            imageUrl={event.image_url}
                            meta={[formatDate(event.starts_at), event.location]
                                .filter(Boolean)
                                .join(' · ')}
                            href={show(event.slug)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleDateString() : null;
}
