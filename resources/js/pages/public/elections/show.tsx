import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import type { ElectionDetail } from '../types';

export default function PublicElectionShow({
    election,
}: {
    election: ElectionDetail;
}) {
    return (
        <>
            <Head>
                <title>{election.title}</title>
                <meta
                    name="description"
                    content={election.description ?? election.title}
                />
            </Head>
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="mb-8 max-w-3xl">
                    <Badge variant="secondary">{election.status}</Badge>
                    <h1 className="mt-3 text-3xl font-semibold">
                        {election.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {election.academic_period.name} ·{' '}
                        {election.academic_period.academic_year}
                    </p>
                    {election.description && (
                        <div className="mt-5">
                            <RichTextViewer value={election.description} />
                        </div>
                    )}
                </div>

                <div className="space-y-5">
                    {election.positions.map((position) => (
                        <section
                            key={position.id}
                            className="rounded-lg border bg-card p-5"
                        >
                            <div className="mb-4">
                                <h2 className="font-semibold">{position.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {position.description ?? 'Approved candidates'}
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {position.candidates.map((candidate) => (
                                    <article
                                        key={candidate.id}
                                        className="rounded-lg border bg-background p-4"
                                    >
                                        {candidate.poster_url && (
                                            <img
                                                src={candidate.poster_url}
                                                alt=""
                                                className="mb-3 aspect-square w-full rounded-md object-cover"
                                            />
                                        )}
                                        <h3 className="font-medium">
                                            {candidate.student_name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {candidate.student_number}
                                        </p>
                                        {candidate.slogan && (
                                            <p className="mt-3 text-sm text-muted-foreground">
                                                {candidate.slogan}
                                            </p>
                                        )}
                                        {candidate.votes_count !== null && (
                                            <p className="mt-3 text-sm font-semibold">
                                                {candidate.votes_count} votes
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
}
