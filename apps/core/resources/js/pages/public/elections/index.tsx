import { Head } from '@inertiajs/react';
import { Vote } from 'lucide-react';
import { PublicContentCard, PublicContentEmpty } from '@/features/public/content-card';
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

            {/* Page header */}
            <div className="border-b bg-muted/30">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                        SRC Portal
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Elections</h1>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Public election information and candidate details. Voting takes place through the student portal.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
