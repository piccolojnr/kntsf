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

            <article className="relative overflow-hidden">
                <section className="theme-paper relative overflow-hidden border-b border-app-border/80">
                    <div
                        className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                        aria-hidden="true"
                    />
                    <div
                        className="public-float pointer-events-none absolute -top-12 right-[14%] size-36 rounded-full border border-dashed border-app-ink/10"
                        aria-hidden="true"
                    />
                    <div className="public-scroll-rise relative mx-auto grid w-full max-w-7xl gap-10 px-5 pt-32 pb-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:pt-36 lg:pb-18">
                        <div className="flex flex-col justify-center">
                            <Link
                                href={index()}
                                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-app-muted transition hover:gap-3 hover:text-app-red"
                            >
                                <ArrowLeft className="size-4" />
                                All announcements
                            </Link>
                            <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                                SRC bulletin
                            </p>
                            <h1 className="mt-4 max-w-4xl text-4xl leading-[1.04] font-semibold tracking-[-0.035em] text-app-ink md:text-6xl">
                                {announcement.title}
                            </h1>
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                {announcement.category && (
                                    <span className="rounded-full bg-app-red/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-app-red uppercase">
                                        {announcement.category}
                                    </span>
                                )}
                                <span className="theme-surface rounded-full border border-app-border px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-app-muted uppercase">
                                    {formatPublicDate(
                                        announcement.published_at,
                                        true,
                                    ) ?? 'Published'}
                                </span>
                            </div>
                            {announcement.excerpt && (
                                <p className="mt-6 max-w-2xl text-base leading-8 text-app-muted md:text-lg">
                                    {announcement.excerpt}
                                </p>
                            )}
                            <p className="public-hand public-scroll-mark mt-7 rotate-[-2deg] text-base text-app-muted">
                                official notice
                            </p>
                        </div>

                        <div className="flex items-end">
                            {announcement.image_url ? (
                                <figure className="public-sketch-card group theme-surface relative min-h-[28rem] w-full overflow-hidden rounded-[1.4rem] border border-app-border shadow-[0_22px_70px_rgba(28,24,38,0.12)]">
                                    <img
                                        src={announcement.image_url}
                                        alt=""
                                        className="public-scroll-drift absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-[#1c1826]/55 via-[#1c1826]/5 to-transparent"
                                        aria-hidden="true"
                                    />
                                    <div
                                        className="absolute inset-4 rounded-[1.05rem] border border-white/18"
                                        aria-hidden="true"
                                    />
                                </figure>
                            ) : (
                                <div className="public-sketch-card public-paper-grain theme-ink-panel relative grid min-h-[28rem] w-full place-items-center overflow-hidden rounded-[1.4rem] border border-app-border shadow-[0_22px_70px_rgba(28,24,38,0.16)]">
                                    <div
                                        className="public-float absolute top-8 right-8 size-24 rounded-full border border-dashed border-white/14"
                                        aria-hidden="true"
                                    />
                                    <Newspaper className="relative size-16 text-app-brass" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[14rem_1fr]">
                    <aside className="hidden lg:block">
                        <div className="public-sketch-card theme-surface sticky top-28 rounded-[1.2rem] border border-app-border p-5 shadow-[0_14px_45px_rgba(28,24,38,0.045)]">
                            <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                                Posted by
                            </p>
                            <p className="mt-3 text-base font-semibold text-app-ink">
                                {announcement.author?.name ?? 'Knutsford SRC'}
                            </p>
                            <div
                                className="public-empty-lines mt-8 h-20"
                                aria-hidden="true"
                            />
                        </div>
                    </aside>
                    <div className="public-sketch-card theme-surface max-w-3xl rounded-[1.4rem] border border-app-border p-6 shadow-[0_18px_55px_rgba(28,24,38,0.055)] md:p-9">
                        <RichTextViewer value={announcement.content} />
                    </div>
                </section>
            </article>
        </>
    );
}
