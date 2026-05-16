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
                <section className="relative overflow-hidden border-b border-[#1f2a24]/10 bg-[#efe3c6] dark:border-white/10 dark:bg-[#111712]">
                    <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1fr_24rem] lg:py-16">
                        <div>
                            <Link
                                href={index()}
                                className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0f5b45] dark:text-[#d8a329]"
                            >
                                <ArrowLeft className="size-4" />
                                All announcements
                            </Link>
                            <div className="flex flex-wrap items-center gap-3">
                                {announcement.category && (
                                    <span className="bg-[#b7352d] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
                                        {announcement.category}
                                    </span>
                                )}
                                <span className="text-xs font-black uppercase tracking-[0.22em] text-[#596257] dark:text-[#b8c3b8]">
                                    {formatPublicDate(announcement.published_at, true) ?? 'Published'}
                                </span>
                            </div>
                            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                                {announcement.title}
                            </h1>
                            {announcement.excerpt && (
                                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#596257] dark:text-[#b8c3b8]">
                                    {announcement.excerpt}
                                </p>
                            )}
                        </div>
                        <div className="flex items-end">
                            {announcement.image_url ? (
                                <img
                                    src={announcement.image_url}
                                    alt=""
                                    className="aspect-[4/5] w-full object-cover shadow-[12px_12px_0_#d8a329]"
                                />
                            ) : (
                                <div className="grid aspect-[4/5] w-full place-items-center border border-[#17211b] bg-[#17211b] text-[#f5ead2] shadow-[12px_12px_0_#d8a329]">
                                    <Newspaper className="size-16 text-[#d8a329]" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_1fr]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 border-l-4 border-[#b7352d] pl-5">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b7352d]">
                                Author
                            </p>
                            <p className="mt-2 font-black">
                                {announcement.author?.name ?? 'Knutsford SRC'}
                            </p>
                        </div>
                    </aside>
                    <div className="max-w-3xl border-t border-[#1f2a24]/10 pt-10 dark:border-white/10">
                        <RichTextViewer value={announcement.content} />
                    </div>
                </section>
            </article>
        </>
    );
}
