import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, MapPin, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { index } from '@/routes/public/events';
import type { EventDetail } from '../types';

export default function PublicEventShow({ event }: { event: EventDetail }) {
    return (
        <>
            <Head>
                <title>{event.title}</title>
                <meta name="description" content={event.excerpt ?? event.title} />
            </Head>

            <article>
                <section className="relative overflow-hidden bg-app-ink text-app-surface">
                    {event.image_url && (
                        <img
                            src={event.image_url}
                            alt=""
                            className="absolute inset-0 size-full object-cover opacity-35 saturate-75"
                        />
                    )}
                    <div className="absolute inset-0 bg-app-ink/70" />
                    <div className="relative mx-auto w-full max-w-7xl px-5 py-12 md:px-8 lg:py-20">
                        <Link
                            href={index()}
                            className="mb-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-app-brass"
                        >
                            <ArrowLeft className="size-4" />
                            All events
                        </Link>
                        {event.category && (
                            <span className="rounded-md bg-app-brass px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-app-ink">
                                {event.category}
                            </span>
                        )}
                        <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                            {event.title}
                        </h1>
                        {event.excerpt && (
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-app-surface/80">
                                {event.excerpt}
                            </p>
                        )}
                    </div>
                </section>

                <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1fr_22rem]">
                    <div className="max-w-3xl">
                        <RichTextViewer value={event.description} />
                    </div>
                    <aside>
                        <div className="public-panel sticky top-28 p-5 shadow-[10px_10px_0_var(--app-brass)]">
                            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-app-red">
                                Event details
                            </p>
                            {event.starts_at && (
                                <DetailRow icon={<CalendarDays />} label="Date and time">
                                    {formatDateTime(event.starts_at)}
                                    {event.ends_at && (
                                        <span className="mt-1 block text-xs text-app-muted">
                                            Until {formatDateTime(event.ends_at)}
                                        </span>
                                    )}
                                </DetailRow>
                            )}
                            {event.location && (
                                <DetailRow icon={<MapPin />} label="Location">
                                    {event.location}
                                </DetailRow>
                            )}
                            {event.organizer && (
                                <DetailRow icon={<User />} label="Organiser">
                                    {event.organizer.name}
                                </DetailRow>
                            )}
                        </div>
                    </aside>
                </section>
            </article>
        </>
    );
}

function DetailRow({
    icon,
    label,
    children,
}: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="border-t border-app-border py-4">
            <div className="mb-2 flex items-center gap-2 text-app-teal dark:text-app-brass [&_svg]:size-4">
                {icon}
                <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                    {label}
                </p>
            </div>
            <div className="text-sm font-black leading-6">{children}</div>
        </div>
    );
}

function formatDateTime(value: string | null) {
    return value
        ? new Date(value).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : 'TBC';
}
