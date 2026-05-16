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
                <section className="relative overflow-hidden bg-[#17211b] text-[#f5ead2]">
                    {event.image_url && (
                        <img
                            src={event.image_url}
                            alt=""
                            className="absolute inset-0 size-full object-cover opacity-35 saturate-75"
                        />
                    )}
                    <div className="absolute inset-0 bg-[#17211b]/70" />
                    <div className="relative mx-auto w-full max-w-7xl px-5 py-12 md:px-8 lg:py-20">
                        <Link
                            href={index()}
                            className="mb-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#d8a329]"
                        >
                            <ArrowLeft className="size-4" />
                            All events
                        </Link>
                        {event.category && (
                            <span className="bg-[#d8a329] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#17211b]">
                                {event.category}
                            </span>
                        )}
                        <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                            {event.title}
                        </h1>
                        {event.excerpt && (
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d7cfba]">
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
                        <div className="sticky top-28 border border-[#17211b] bg-[#fffaf0] p-5 shadow-[10px_10px_0_#d8a329] dark:border-white/10 dark:bg-[#111712]">
                            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[#b7352d]">
                                Event details
                            </p>
                            {event.starts_at && (
                                <DetailRow icon={<CalendarDays />} label="Date and time">
                                    {formatDateTime(event.starts_at)}
                                    {event.ends_at && (
                                        <span className="mt-1 block text-xs text-[#596257] dark:text-[#b8c3b8]">
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
        <div className="border-t border-[#1f2a24]/10 py-4 dark:border-white/10">
            <div className="mb-2 flex items-center gap-2 text-[#0f5b45] dark:text-[#d8a329] [&_svg]:size-4">
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
