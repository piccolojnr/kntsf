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
                title="Campus events"
                description="Upcoming campus activities, civic gatherings, and programmes organised by the Student Representative Council."
                count={items.length}
                backgroundImageUrl="/images/events.jpg"
            />
            <section className="relative overflow-hidden bg-[#f8f7f3]">
                <div
                    className="absolute top-20 right-[8%] size-48 rounded-full bg-app-brass/12 blur-3xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-18">
                    <aside className="lg:pt-3">
                        <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                            Calendar desk
                        </p>
                        <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                            What is happening next
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-app-muted">
                            Browse public programmes, meetings, and student activities
                            worth noting.
                        </p>
                        <p className="public-hand public-scroll-mark mt-6 rotate-[-2deg] text-base text-app-muted">
                            save the date
                        </p>
                    </aside>

                    <div>
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {items.length === 0 ? (
                                <PublicContentEmpty
                                    icon={<CalendarDays className="size-8" />}
                                    message="No events are currently listed. This space will hold the next public calendar entries once they are published."
                                />
                            ) : (
                                items.map((event) => (
                                    <PublicContentCard
                                        key={event.id}
                                        title={event.title}
                                        description={event.excerpt}
                                        imageUrl={event.image_url}
                                        meta={[
                                            formatPublicDate(event.starts_at),
                                            event.location,
                                        ]
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
                    </div>
                </div>
            </section>
        </>
    );
}
