import { Head } from '@inertiajs/react';
import { PublicContentCard } from '@/features/public/content-card';
import { show } from '@/routes/public/elections';
import type { ElectionSummary, Paginated } from '../types';

export default function PublicElectionsIndex({
    elections,
}: {
    elections: Paginated<ElectionSummary>;
}) {
    return (
        <>
            <Head title="Elections" />
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold">Elections</h1>
                    <p className="mt-2 text-muted-foreground">
                        Public election information. Voting is not available on
                        the public portal.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {elections.data.map((election) => (
                        <PublicContentCard
                            key={election.id}
                            title={election.title}
                            description={election.description}
                            meta={`${election.academic_period.name} · ${election.status}`}
                            href={show(election.slug)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
