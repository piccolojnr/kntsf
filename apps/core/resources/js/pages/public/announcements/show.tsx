import { Head } from '@inertiajs/react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import type { AnnouncementDetail } from '../types';

export default function PublicAnnouncementShow({
    announcement,
}: {
    announcement: AnnouncementDetail;
}) {
    return (
        <>
            <Head>
                <title>{announcement.title}</title>
                <meta
                    name="description"
                    content={announcement.excerpt ?? announcement.title}
                />
            </Head>
            <article className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
                {announcement.image_url && (
                    <img
                        src={announcement.image_url}
                        alt=""
                        className="mb-6 aspect-video w-full rounded-lg object-cover"
                    />
                )}
                <p className="text-sm text-muted-foreground">
                    {formatDate(announcement.published_at)}
                    {announcement.category ? ` · ${announcement.category}` : ''}
                </p>
                <h1 className="mt-3 text-3xl font-semibold">
                    {announcement.title}
                </h1>
                {announcement.excerpt && (
                    <p className="mt-3 text-lg leading-8 text-muted-foreground">
                        {announcement.excerpt}
                    </p>
                )}
                <div className="mt-8">
                    <RichTextViewer value={announcement.content} />
                </div>
            </article>
        </>
    );
}

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleDateString() : 'Published';
}
