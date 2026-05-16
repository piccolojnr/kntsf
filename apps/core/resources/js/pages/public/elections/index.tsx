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
    const items = elections.data;

    return (
        <>
            <Head title="Elections" />
            <PublicPageHeader
                eyebrow="Civic Process"
                title="Elections"
                description="Public election information, approved candidates, and visible results where the election rules allow them."
                count={items.length}
            />
            <section className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.length === 0 ? (
                        <PublicContentEmpty
                            icon={<Vote className="size-8" />}
                            message="No elections are currently listed."
                        />
                    ) : (
                        items.map((election) => (
                            <PublicContentCard
                                key={election.id}
                                title={election.title}
                                description={election.description}
                                meta={election.academic_period.name}
                                category={election.status}
                                href={show(election.slug)}
                                tone="red"
                            />
                        ))
                    )}
                </div>
                <PublicPagination links={elections.links} />
            </section>
        </>
    );
}
