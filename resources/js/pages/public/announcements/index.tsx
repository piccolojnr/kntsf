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
            />
            <section className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                                meta={formatPublicDate(announcement.published_at)}
                                category={announcement.category}
                                href={show(announcement.slug)}
                                tone={index === 0 ? 'red' : 'green'}
                            />
                        ))
                    )}
                </div>
                <PublicPagination links={announcements.links} />
            </section>
        </>
    );
}
