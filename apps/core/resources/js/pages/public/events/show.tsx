import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, MapPin, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { formatPublicDate } from '@/features/public/content-card';
import { index } from '@/routes/public/events';
import type { EventDetail } from '../types';

export default function PublicEventShow({ event }: { event: EventDetail }) {
    const eventDate = formatPublicDate(event.starts_at, true);

    return (
        <>
            <Head>
                <title>{event.title}</title>
                <meta name="description" content={event.excerpt ?? event.title} />
            </Head>

            <article>
                <section className="relative overflow-hidden bg-[#f8f7f3]">
                    <div
                        className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute -top-16 right-[10%] size-48 rounded-full bg-app-brass/14 blur-3xl"
                        aria-hidden="true"
                    />
                    <div className="public-scroll-rise relative mx-auto grid w-full max-w-7xl gap-10 px-5 pt-32 pb-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:pt-36 lg:pb-18">
                        <div>
                            <Link
                                href={index()}
                                className="public-drawn-link mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-app-muted uppercase transition hover:text-app-red"
                            >
                                <ArrowLeft className="size-4" />
                                All events
                            </Link>
                            <div className="flex flex-wrap items-center gap-3">
                                {event.category && (
                                    <span className="rounded-full bg-app-brass/18 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-app-ink uppercase">
                                        {event.category}
                                    </span>
                                )}
                                {eventDate && (
                                    <span className="text-xs font-medium tracking-[0.14em] text-app-muted uppercase">
                                        {eventDate}
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-5 max-w-5xl text-4xl leading-[1.04] font-semibold tracking-[-0.03em] text-app-ink md:text-6xl">
                                {event.title}
                            </h1>
                            {event.excerpt && (
                                <p className="mt-6 max-w-2xl text-base leading-8 text-app-muted md:text-lg">
                                    {event.excerpt}
                                </p>
                            )}
                            <p className="public-hand public-scroll-mark mt-7 rotate-[-2deg] text-base text-app-muted">
                                campus calendar
                            </p>
                        </div>

                        <figure className="public-sketch-card relative min-h-72 overflow-hidden rounded-[1.5rem] border border-app-border bg-app-ink shadow-[0_20px_60px_rgba(28,24,38,0.09)]">
                            {event.image_url ? (
                                <img
                                    src={event.image_url}
                                    alt=""
                                    className="public-scroll-drift size-full object-cover"
                                />
                            ) : (
                                <div className="public-paper-grain flex size-full min-h-72 items-center justify-center bg-app-ink text-white">
                                    <div
                                        className="public-float absolute top-8 right-8 size-24 rounded-full border border-dashed border-white/20"
                                        aria-hidden="true"
                                    />
                                    <CalendarDays className="size-14 text-white/54" />
                                </div>
                            )}
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-app-ink/42 via-transparent to-transparent"
                                aria-hidden="true"
                            />
                            <div
                                className="absolute inset-4 rounded-[1.05rem] border border-white/20"
                                aria-hidden="true"
                            />
                        </figure>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-[#f8f7f3]">
                    <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_1fr] lg:py-18">
                        <aside>
                            <div className="public-sketch-card sticky top-28 rounded-[1.25rem] border border-app-border bg-white/74 p-5 shadow-[0_16px_45px_rgba(28,24,38,0.055)]">
                                <p className="mb-5 text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                                    Event details
                                </p>
                                {event.starts_at && (
                                    <DetailRow
                                        icon={<CalendarDays />}
                                        label="Date and time"
                                    >
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
                                <p className="public-hand mt-4 rotate-[-2deg] text-base text-app-muted">
                                    noted for students
                                </p>
                            </div>
                        </aside>
                        <div className="public-sketch-card max-w-3xl rounded-[1.4rem] border border-app-border bg-white/78 p-6 shadow-[0_18px_55px_rgba(28,24,38,0.055)] md:p-9">
                            <RichTextViewer value={event.description} />
                        </div>
                    </div>
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
        <div className="border-t border-app-border py-4 first:border-t-0 first:pt-0">
            <div className="mb-2 flex items-center gap-2 text-app-red dark:text-app-brass [&_svg]:size-4">
                {icon}
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase">
                    {label}
                </p>
            </div>
            <div className="text-sm leading-6 font-semibold text-app-ink">{children}</div>
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
