import { Head } from '@inertiajs/react';
import { PublicContentCard } from '@/features/public/content-card';
import { show } from '@/routes/public/announcements';
import type { AnnouncementSummary, Paginated } from '../types';

export default function PublicAnnouncementsIndex({
    announcements,
}: {
    announcements: Paginated<AnnouncementSummary>;
}) {
    return (
        <>
            <Head title="Announcements" />
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold">Announcements</h1>
                    <p className="mt-2 text-muted-foreground">
                        Published public updates from the SRC.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {announcements.data.map((announcement) => (
                        <PublicContentCard
                            key={announcement.id}
                            title={announcement.title}
                            description={announcement.excerpt}
                            imageUrl={announcement.image_url}
                            meta={formatDate(announcement.published_at)}
                            href={show(announcement.slug)}
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
