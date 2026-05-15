import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { index } from '@/routes/public/announcements';
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
                {/* Back link */}
                <Link
                    href={index()}
                    className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-3.5" />
                    All announcements
                </Link>

                {/* Featured image */}
                {announcement.image_url && (
                    <img
                        src={announcement.image_url}
                        alt=""
                        className="mb-8 aspect-video w-full rounded-lg object-cover"
                    />
                )}

                {/* Meta */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {announcement.category && (
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                            {announcement.category}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {formatDate(announcement.published_at)}
                    </span>
                    {announcement.author && (
                        <span className="text-xs text-muted-foreground">
                            · {announcement.author.name}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                    {announcement.title}
                </h1>

                {/* Excerpt */}
                {announcement.excerpt && (
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        {announcement.excerpt}
                    </p>
                )}

                {/* Divider */}
                <hr className="my-8" />

                {/* Body */}
                <RichTextViewer value={announcement.content} />
            </article>
        </>
    );
}

function formatDate(value: string | null) {
    return value
        ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Published';
}
