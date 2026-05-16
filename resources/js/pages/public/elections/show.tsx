import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Trophy, Vote } from 'lucide-react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { index } from '@/routes/public/elections';
import type { ElectionDetail } from '../types';

const statusStyles: Record<string, string> = {
    active: 'bg-app-teal text-white',
    scheduled: 'bg-app-brass text-app-ink',
    closed: 'bg-app-ink text-app-surface',
    archived: 'bg-app-muted text-white',
};

export default function PublicElectionShow({
    election,
}: {
    election: ElectionDetail;
}) {
    const statusStyle =
        statusStyles[election.status.toLowerCase()] ?? statusStyles.closed;

    return (
        <>
            <Head>
                <title>{election.title}</title>
                <meta
                    name="description"
                    content={election.description ?? election.title}
                />
            </Head>

            <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
                <Link
                    href={index()}
                    className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-app-teal dark:text-app-brass"
                >
                    <ArrowLeft className="size-4" />
                    All elections
                </Link>

                <section className="rounded-md border border-app-ink bg-app-surface-muted p-6 shadow-[14px_14px_0_var(--app-brass)] dark:border-app-border md:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${statusStyle}`}
                        >
                            {election.status}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-app-muted">
                            <CalendarDays className="size-4" />
                            {election.academic_period.name} /{' '}
                            {election.academic_period.academic_year}
                        </span>
                    </div>
                    <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                        {election.title}
                    </h1>
                    {election.description && (
                        <div className="mt-7 max-w-3xl text-app-muted">
                            <RichTextViewer value={election.description} />
                        </div>
                    )}
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <ElectionMetric
                            label="Positions"
                            value={election.positions.length}
                        />
                        <ElectionMetric
                            label="Candidates"
                            value={election.positions.reduce(
                                (total, position) =>
                                    total + position.candidates.length,
                                0,
                            )}
                        />
                        <ElectionMetric
                            label="Results"
                            value={election.results_visible ? 'Visible' : 'Hidden'}
                        />
                    </div>
                </section>

                {election.positions.length === 0 ? (
                    <div className="mt-14 grid min-h-72 place-items-center rounded-md border border-dashed border-app-border text-center">
                        <div>
                            <Vote className="mx-auto mb-4 size-10 text-app-teal dark:text-app-brass" />
                            <p className="font-semibold text-app-muted">
                                No positions have been listed for this election.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-16 space-y-16">
                        {election.positions.map((position, positionIndex) => (
                            <section key={position.id}>
                                <div className="mb-6 flex flex-col justify-between gap-3 border-b border-app-border pb-5 md:flex-row md:items-end">
                                    <div>
                                        <p className="public-kicker">
                                            Position {positionIndex + 1}
                                        </p>
                                        <h2 className="mt-2 text-4xl font-black tracking-normal">
                                            {position.title}
                                        </h2>
                                        {position.description && (
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">
                                                {position.description}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-app-muted">
                                        {position.candidates.length} candidate
                                        {position.candidates.length === 1 ? '' : 's'}
                                    </p>
                                </div>

                                {position.candidates.length === 0 ? (
                                    <p className="text-sm italic text-app-muted">
                                        No candidates listed for this position.
                                    </p>
                                ) : (
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {position.candidates.map((candidate) => (
                                            <article
                                                key={candidate.id}
                                                className="public-panel group overflow-hidden"
                                            >
                                                <div className="relative aspect-[4/5] overflow-hidden bg-app-surface-muted">
                                                    {candidate.poster_url ? (
                                                        <img
                                                            src={candidate.poster_url}
                                                            alt=""
                                                            className="size-full object-cover transition duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="grid size-full place-items-center">
                                                            <span className="text-7xl font-black text-app-teal/20 dark:text-app-brass/30">
                                                                {candidate.student_name?.slice(
                                                                    0,
                                                                    1,
                                                                ) ?? '?'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {candidate.votes_count !== null && (
                                                        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-app-ink px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-app-surface">
                                                            <Trophy className="size-4 text-app-brass" />
                                                            {candidate.votes_count} votes
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="text-2xl font-black leading-tight">
                                                        {candidate.student_name}
                                                    </h3>
                                                    <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-app-red">
                                                        {candidate.student_number}
                                                    </p>
                                                    {candidate.slogan && (
                                                        <p className="mt-4 border-l-4 border-app-brass pl-4 text-sm font-semibold italic leading-6 text-app-muted">
                                                            "{candidate.slogan}"
                                                        </p>
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

function ElectionMetric({
    label,
    value,
}: {
    label: string;
    value: number | string;
}) {
    return (
        <div className="rounded-md border border-app-border bg-app-surface p-4">
            <p className="text-3xl font-black">{value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-app-muted">
                {label}
            </p>
        </div>
    );
}
