import { Head } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import {
    PublicContentCard,
    PublicContentEmpty,
} from '@/features/public/content-card';
import { show } from '@/routes/public/announcements';
import type { AnnouncementSummary, Paginated } from '../types';

export default function PublicAnnouncementsIndex({
    announcements,
}: {
    announcements: Paginated<AnnouncementSummary>;
}) {
    const items = announcements.data;

    return (
        <>
            <Head title="Announcements" />

            {/* Page header */}
            <div className="border-b bg-muted/30">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                        SRC Portal
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Announcements</h1>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Official public updates, notices, and communications from the Student Representative Council.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {items.length === 0 ? (
                        <PublicContentEmpty
                            icon={<Bell className="size-8" />}
                            message="No announcements have been published yet."
                        />
                    ) : (
                        items.map((announcement) => (
                            <PublicContentCard
                                key={announcement.id}
                                title={announcement.title}
                                description={announcement.excerpt}
                                imageUrl={announcement.image_url}
                                meta={formatDate(announcement.published_at)}
                                category={announcement.category}
                                href={show(announcement.slug)}
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
