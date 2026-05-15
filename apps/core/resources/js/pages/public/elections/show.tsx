import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Vote } from 'lucide-react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { index } from '@/routes/public/elections';
import type { ElectionDetail } from '../types';

const statusStyles: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    upcoming: 'bg-blue-50 text-blue-700',
    closed: 'bg-muted text-muted-foreground',
};

export default function PublicElectionShow({
    election,
}: {
    election: ElectionDetail;
}) {
    const statusStyle = statusStyles[election.status.toLowerCase()] ?? statusStyles.closed;

    return (
        <>
            <Head>
                <title>{election.title}</title>
                <meta name="description" content={election.description ?? election.title} />
            </Head>

            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                {/* Back link */}
                <Link
                    href={index()}
                    className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-3.5" />
                    All elections
                </Link>

                {/* Election header */}
                <div className="mb-10 max-w-2xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}
                        >
                            {election.status}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="size-3.5" />
                            {election.academic_period.name} · {election.academic_period.academic_year}
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {election.title}
                    </h1>

                    {election.description && (
                        <div className="mt-4 text-muted-foreground">
                            <RichTextViewer value={election.description} />
                        </div>
                    )}
                </div>

                {/* Positions */}
                {election.positions.length === 0 ? (
                    <div className="rounded-md border border-dashed py-14 text-center">
                        <Vote className="mx-auto mb-3 size-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No positions have been listed for this election.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {election.positions.map((position) => (
                            <section key={position.id}>
                                {/* Position header */}
                                <div className="mb-5 border-b pb-3">
                                    <h2 className="text-lg font-bold">{position.title}</h2>
                                    {position.description && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {position.description}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {position.candidates.length}{' '}
                                        {position.candidates.length === 1 ? 'candidate' : 'candidates'}
                                    </p>
                                </div>

                                {/* Candidates */}
                                {position.candidates.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">
                                        No candidates listed for this position.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                        {position.candidates.map((candidate) => (
                                            <article
                                                key={candidate.id}
                                                className="overflow-hidden rounded-md border bg-card"
                                            >
                                                {/* Poster / avatar */}
                                                {candidate.poster_url ? (
                                                    <img
                                                        src={candidate.poster_url}
                                                        alt=""
                                                        className="aspect-square w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-square w-full items-center justify-center bg-muted">
                                                        <span className="text-4xl font-bold text-muted-foreground/25">
                                                            {candidate.student_name?.slice(0, 1) ?? '?'}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="p-4">
                                                    <h3 className="font-bold leading-snug">
                                                        {candidate.student_name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        {candidate.student_number}
                                                    </p>

                                                    {candidate.slogan && (
                                                        <p className="mt-3 border-l-2 border-primary/30 pl-3 text-xs italic leading-5 text-muted-foreground">
                                                            "{candidate.slogan}"
                                                        </p>
                                                    )}

                                                    {candidate.votes_count !== null && (
                                                        <div className="mt-3">
                                                            <span className="inline-block rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                                                {candidate.votes_count} votes
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
