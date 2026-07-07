import { Head } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import {
    formatPublicDate,
    PublicContentCard,
    PublicContentEmpty,
    PublicPageHeader,
    PublicPagination,
} from '@/features/public/content-card';
import { show } from '@/routes/public/announcements';
import type { AnnouncementSummary, Paginated } from '../types';

export default function PublicAnnouncementsIndex({
    announcements,
}: {
    announcements: Paginated<AnnouncementSummary>;
}) {
    const items = announcements.data ?? [];

    return (
        <>
            <Head title="Announcements" />
            <PublicPageHeader
                eyebrow="SRC Bulletin"
                title="Announcements"
                description="Official public updates, notices, and communications from the Student Representative Council."
                count={items.length}
                backgroundImageUrl="/images/ceremony.jpg"
            />

            <section className="relative overflow-hidden bg-[#f8f7f3]">
                <div
                    className="pointer-events-none absolute top-12 left-[8%] h-16 w-44 rotate-[-5deg] rounded-full bg-app-brass/16 blur-2xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
                    <aside className="relative">
                        <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                            Notice stack
                        </p>
                        <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                            Recent public bulletins
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-app-muted">
                            Official notices arranged for quick scanning and
                            reading.
                        </p>
                        <p className="public-hand public-scroll-mark mt-8 hidden rotate-[-3deg] text-base text-app-muted md:block">
                            posted here
                        </p>
                    </aside>

                    <div>
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {items.length === 0 ? (
                                <PublicContentEmpty
                                    icon={<Bell className="size-8" />}
                                    message="No announcements have been published yet."
                                />
                            ) : (
                                items.map((announcement, index) => (
                                    <PublicContentCard
                                        key={announcement.id}
                                        title={announcement.title}
                                        description={announcement.excerpt}
                                        imageUrl={announcement.image_url}
                                        meta={formatPublicDate(
                                            announcement.published_at,
                                        )}
                                        category={announcement.category}
                                        href={show(announcement.slug)}
                                        tone={index === 0 ? 'red' : 'green'}
                                    />
                                ))
                            )}
                        </div>
                        <PublicPagination links={announcements.links} />
                    </div>
                </div>
            </section>
        </>
    );
}
