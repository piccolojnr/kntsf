import { Head } from '@inertiajs/react';
import { Vote } from 'lucide-react';
import {
    PublicContentCard,
    PublicContentEmpty,
    PublicPageHeader,
    PublicPagination,
} from '@/features/public/content-card';
import { show } from '@/routes/public/elections';
import type { ElectionSummary, Paginated } from '../types';

export default function PublicElectionsIndex({
    elections,
}: {
    elections: Paginated<ElectionSummary>;
}) {
    const items = elections.data ?? [];

    return (
        <>
            <Head title="Elections" />
            <PublicPageHeader
                eyebrow="Civic Process"
                title="Elections"
                description="Public election information, approved candidates, and visible results where the election rules allow them."
                count={items.length}
                backgroundImageUrl="/images/campus-hero.jpg"
            />
            <section className="theme-paper relative overflow-hidden">
                <div
                    className="absolute top-12 right-[9%] size-48 rounded-full bg-app-red/8 blur-3xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-18">
                    <aside className="lg:pt-3">
                        <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                            Voting desk
                        </p>
                        <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                            Civic records in view
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-app-muted">
                            Election pages collect approved timelines,
                            candidates, and results when the rules make them
                            public.
                        </p>
                        <p className="public-hand public-scroll-mark mt-6 rotate-[-2deg] text-base text-app-muted">
                            ballot notes
                        </p>
                    </aside>

                    <div>
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {items.length === 0 ? (
                                <PublicContentEmpty
                                    icon={<Vote className="size-8" />}
                                    message="No elections are currently listed. Future election records will appear in this civic desk."
                                />
                            ) : (
                                items.map((election) => (
                                    <PublicContentCard
                                        key={election.id}
                                        title={election.title}
                                        description={election.description}
                                        meta={[
                                            election.academic_period.name,
                                            election.academic_period
                                                .academic_year,
                                        ]
                                            .filter(Boolean)
                                            .join(' / ')}
                                        category={election.status}
                                        href={show(election.slug)}
                                        tone="red"
                                    />
                                ))
                            )}
                        </div>
                        <PublicPagination links={elections.links} />
                    </div>
                </div>
            </section>
        </>
    );
}
