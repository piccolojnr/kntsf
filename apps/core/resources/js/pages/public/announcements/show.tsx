import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { formatPublicDate } from '@/features/public/content-card';
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

            <article>
                <section className="relative overflow-hidden border-b border-app-border bg-app-surface-muted">
                    <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1fr_24rem] lg:py-16">
                        <div>
                            <Link
                                href={index()}
                                className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-app-teal dark:text-app-brass"
                            >
                                <ArrowLeft className="size-4" />
                                All announcements
                            </Link>
                            <div className="flex flex-wrap items-center gap-3">
                                {announcement.category && (
                                    <span className="rounded-md bg-app-red px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
                                        {announcement.category}
                                    </span>
                                )}
                                <span className="text-xs font-black uppercase tracking-[0.22em] text-app-muted">
                                    {formatPublicDate(announcement.published_at, true) ?? 'Published'}
                                </span>
                            </div>
                            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                                {announcement.title}
                            </h1>
                            {announcement.excerpt && (
                                <p className="mt-6 max-w-2xl text-lg leading-8 text-app-muted">
                                    {announcement.excerpt}
                                </p>
                            )}
                        </div>
                        <div className="flex items-end">
                            {announcement.image_url ? (
                                <img
                                    src={announcement.image_url}
                                    alt=""
                                    className="aspect-[4/5] w-full rounded-md object-cover shadow-[12px_12px_0_var(--app-brass)]"
                                />
                            ) : (
                                <div className="grid aspect-[4/5] w-full place-items-center rounded-md border border-app-ink bg-app-ink text-app-surface shadow-[12px_12px_0_var(--app-brass)]">
                                    <Newspaper className="size-16 text-app-brass" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_1fr]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 rounded-md border-l-4 border-app-red bg-app-surface/60 p-5">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-app-red">
                                Author
                            </p>
                            <p className="mt-2 font-black">
                                {announcement.author?.name ?? 'Knutsford SRC'}
                            </p>
                        </div>
                    </aside>
                    <div className="max-w-3xl border-t border-app-border pt-10">
                        <RichTextViewer value={announcement.content} />
                    </div>
                </section>
            </article>
        </>
    );
}
