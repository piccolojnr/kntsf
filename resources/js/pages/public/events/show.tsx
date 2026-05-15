import { Head } from '@inertiajs/react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import type { EventDetail } from '../types';

export default function PublicEventShow({ event }: { event: EventDetail }) {
    return (
        <>
            <Head>
                <title>{event.title}</title>
                <meta name="description" content={event.excerpt ?? event.title} />
            </Head>
            <article className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
                {event.image_url && (
                    <img
                        src={event.image_url}
                        alt=""
                        className="mb-6 aspect-video w-full rounded-lg object-cover"
                    />
                )}
                <p className="text-sm text-muted-foreground">
                    {formatDate(event.starts_at)}
                    {event.location ? ` · ${event.location}` : ''}
                </p>
                <h1 className="mt-3 text-3xl font-semibold">{event.title}</h1>
                {event.excerpt && (
                    <p className="mt-3 text-lg leading-8 text-muted-foreground">
                        {event.excerpt}
                    </p>
                )}
                <div className="mt-8">
                    <RichTextViewer value={event.description} />
                </div>
            </article>
        </>
    );
}

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleString() : 'Date not set';
}
