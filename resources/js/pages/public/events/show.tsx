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

            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                {/* Back link */}
                <Link
                    href={index()}
                    className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-3.5" />
                    All events
                </Link>

                {/* Two-column layout: stacks on mobile, side-by-side on lg */}
                <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">

                    {/* ── Article ──────────────────────────────────────── */}
                    <article>
                        {event.image_url && (
                            <img
                                src={event.image_url}
                                alt=""
                                className="mb-8 aspect-video w-full rounded-md object-cover"
                            />
                        )}

                        {event.category && (
                            <span className="mb-3 inline-block rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {event.category}
                            </span>
                        )}

                        <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                            {event.title}
                        </h1>

                        {event.excerpt && (
                            <p className="mt-3 text-base leading-7 text-muted-foreground">
                                {event.excerpt}
                            </p>
                        )}

                        <hr className="my-8" />

                        <RichTextViewer value={event.description} />
                    </article>

                    {/* ── Sidebar ───────────────────────────────────────── */}
                    <aside>
                        <div className="rounded-md border bg-card divide-y">
                            <div className="px-4 py-3">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Event details
                                </p>
                            </div>

                            {event.starts_at && (
                                <DetailRow icon={<CalendarDays className="size-4" />} label="Date & Time">
                                    <span className="text-sm font-medium">{formatDateTime(event.starts_at)}</span>
                                    {event.ends_at && (
                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            Until {formatDateTime(event.ends_at)}
                                        </span>
                                    )}
                                </DetailRow>
                            )}

                            {event.location && (
                                <DetailRow icon={<MapPin className="size-4" />} label="Location">
                                    <span className="text-sm font-medium">{event.location}</span>
                                </DetailRow>
                            )}

                            {event.organizer && (
                                <DetailRow icon={<User className="size-4" />} label="Organiser">
                                    <span className="text-sm font-medium">{event.organizer.name}</span>
                                </DetailRow>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
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
        <div className="flex gap-3 p-4">
            <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <div className="mt-0.5">{children}</div>
            </div>
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
