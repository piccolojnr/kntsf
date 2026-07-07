import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import {
    PublicContentEmpty,
    PublicPageHeader,
} from '@/features/public/content-card';
import type { ExecutiveSummary } from '../types';

type ExecutivesProp =
    | ExecutiveSummary[]
    | { data?: ExecutiveSummary[] }
    | Record<string, ExecutiveSummary>;

export default function PublicExecutivesIndex({
    executives,
}: {
    executives: ExecutivesProp;
}) {
    const items = normalizeExecutives(executives);

    return (
        <>
            <Head title="SRC Executives" />
            <PublicPageHeader
                eyebrow="Leadership"
                title="SRC Executives"
                description="Meet the student leaders representing the campus through the Student Representative Council."
                count={items.length}
                backgroundImageUrl="/images/leadership-photo.jpg"
            />

            <section className="relative overflow-hidden bg-[#f8f7f3]">
                <div
                    className="absolute top-14 right-[8%] size-52 rounded-full bg-app-brass/12 blur-3xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-18">
                    <aside className="lg:pt-3">
                        <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                            Leadership desk
                        </p>
                        <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                            Current student leaders
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-app-muted">
                            Names, roles, and short public notes for the people
                            representing the student body.
                        </p>
                        <p className="public-hand public-scroll-mark mt-6 rotate-[-2deg] text-base text-app-muted">
                            council roll
                        </p>
                    </aside>

                    <div>
                        {items.length === 0 ? (
                            <div className="grid grid-cols-1">
                                <PublicContentEmpty
                                    icon={<Users className="size-8" />}
                                    message="No executive profiles have been published. This leadership desk is ready for the current council."
                                />
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {items.map((executive) => (
                                    <article
                                        key={executive.id}
                                        className="public-sketch-card public-scroll-rise group overflow-hidden rounded-[1.25rem] border border-app-border bg-white/76 shadow-[0_14px_42px_rgba(28,24,38,0.05)] transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:bg-app-surface/70"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden bg-app-surface-muted/70">
                                            {executive.avatar_url ? (
                                                <img
                                                    src={executive.avatar_url}
                                                    alt=""
                                                    className="public-scroll-drift size-full object-cover transition duration-700 ease-out group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="public-paper-grain flex size-full items-center justify-center">
                                                    <div
                                                        className="public-float absolute top-6 right-7 size-18 rounded-full border border-dashed border-app-ink/12"
                                                        aria-hidden="true"
                                                    />
                                                    <Users className="size-12 text-app-muted/34" />
                                                </div>
                                            )}
                                            <div
                                                className="absolute inset-3 rounded-[0.9rem] border border-white/18"
                                                aria-hidden="true"
                                            />
                                            {executive.category && (
                                                <span className="absolute top-4 left-4 rounded-full bg-app-red/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-app-red uppercase shadow-[0_10px_30px_rgba(12,10,18,0.08)]">
                                                    {executive.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h2 className="text-xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                                                {executive.name}
                                            </h2>
                                            <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-app-muted uppercase">
                                                {executive.position}
                                            </p>
                                            {executive.position_description && (
                                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-app-muted">
                                                    {executive.position_description}
                                                </p>
                                            )}
                                            {executive.biography && (
                                                <div className="mt-4 line-clamp-4 border-t border-app-border pt-4 text-sm leading-6 text-app-muted">
                                                    <RichTextViewer
                                                        value={executive.biography}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

function normalizeExecutives(executives: ExecutivesProp): ExecutiveSummary[] {
    if (Array.isArray(executives)) {
        return executives;
    }

    if ('data' in executives && Array.isArray(executives.data)) {
        return executives.data;
    }

    return Object.values(executives);
}
