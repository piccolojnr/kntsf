import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Eye,
    EyeOff,
    Trophy,
    UserRound,
    Vote,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { index } from '@/routes/public/elections';
import type { ElectionDetail } from '../types';

const statusStyles: Record<string, string> = {
    active: 'bg-app-red/10 text-app-red',
    scheduled: 'bg-app-brass/18 text-app-ink',
    closed: 'theme-ink-soft text-app-ink',
    archived: 'bg-app-muted/12 text-app-muted',
};

export default function PublicElectionShow({
    election,
}: {
    election: ElectionDetail;
}) {
    const statusStyle =
        statusStyles[election.status.toLowerCase()] ?? statusStyles.closed;
    const candidateCount = election.positions.reduce(
        (total, position) => total + position.candidates.length,
        0,
    );

    return (
        <>
            <Head>
                <title>{election.title}</title>
                <meta
                    name="description"
                    content={election.description ?? election.title}
                />
            </Head>

            <article className="theme-paper">
                <section className="theme-paper relative overflow-hidden border-b border-app-border/80">
                    <div
                        className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                        aria-hidden="true"
                    />
                    <div
                        className="public-float pointer-events-none absolute -top-16 right-[12%] size-44 rounded-full border border-dashed border-app-ink/10"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute right-[8%] bottom-10 h-28 w-56 rotate-[-8deg] rounded-full bg-app-red/8 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="public-scroll-rise relative mx-auto grid w-full max-w-7xl gap-10 px-5 pt-32 pb-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pt-36 lg:pb-18">
                        <div>
                            <Link
                                href={index()}
                                className="public-drawn-link inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-app-muted uppercase transition hover:text-app-red"
                            >
                                <ArrowLeft className="size-4" />
                                All elections
                            </Link>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <span
                                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase ${statusStyle}`}
                                >
                                    {election.status}
                                </span>
                                <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-app-muted uppercase">
                                    <CalendarDays className="size-4" />
                                    {election.academic_period.name} /{' '}
                                    {election.academic_period.academic_year}
                                </span>
                            </div>

                            <h1 className="mt-5 max-w-5xl text-4xl leading-[1.04] font-semibold tracking-[-0.03em] text-app-ink md:text-6xl">
                                {election.title}
                            </h1>

                            {election.description && (
                                <div className="mt-6 max-w-3xl text-base leading-8 text-app-muted">
                                    <RichTextViewer
                                        value={election.description}
                                    />
                                </div>
                            )}

                            <p className="public-hand public-scroll-mark mt-7 rotate-[-2deg] text-base text-app-muted">
                                civic record
                            </p>
                        </div>

                        <div className="grid content-end gap-3">
                            <ElectionMetric
                                icon={<Vote />}
                                label="Positions"
                                value={election.positions.length}
                            />
                            <ElectionMetric
                                icon={<UserRound />}
                                label="Candidates"
                                value={candidateCount}
                            />
                            <ElectionMetric
                                icon={
                                    election.results_visible ? (
                                        <Eye />
                                    ) : (
                                        <EyeOff />
                                    )
                                }
                                label="Results"
                                value={
                                    election.results_visible
                                        ? 'Visible'
                                        : 'Hidden'
                                }
                            />
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden">
                    <div
                        className="absolute top-20 right-[10%] size-52 rounded-full bg-app-brass/10 blur-3xl"
                        aria-hidden="true"
                    />
                    <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-18">
                        <aside className="lg:pt-3">
                            <div className="public-sketch-card theme-surface sticky top-28 rounded-[1.25rem] border border-app-border p-5 shadow-[0_16px_45px_rgba(28,24,38,0.055)]">
                                <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                                    Election desk
                                </p>
                                <p className="mt-4 text-sm leading-7 text-app-muted">
                                    Positions and approved candidates are
                                    grouped below. Vote counts only appear when
                                    results are public.
                                </p>
                                <div className="mt-5 border-t border-app-border pt-5">
                                    <p className="text-3xl font-semibold tracking-[-0.04em] text-app-ink">
                                        {election.results_visible
                                            ? (election.votes_count ?? 0)
                                            : '-'}
                                    </p>
                                    <p className="mt-1 text-[10px] font-medium tracking-[0.18em] text-app-muted uppercase">
                                        Public votes
                                    </p>
                                </div>
                                <p className="public-hand mt-5 rotate-[-2deg] text-base text-app-muted">
                                    ballot notes
                                </p>
                            </div>
                        </aside>

                        {election.positions.length === 0 ? (
                            <div className="public-sketch-card public-paper-grain theme-surface relative min-h-80 overflow-hidden rounded-[1.4rem] border border-app-border p-6">
                                <div
                                    className="public-float absolute top-8 right-9 size-24 rounded-full border border-dashed border-app-ink/12"
                                    aria-hidden="true"
                                />
                                <div className="relative flex min-h-68 flex-col justify-between">
                                    <span className="theme-ink-soft grid size-14 place-items-center rounded-full text-app-muted">
                                        <Vote className="size-8" />
                                    </span>
                                    <div>
                                        <div
                                            className="public-empty-lines mb-6 h-20 max-w-sm"
                                            aria-hidden="true"
                                        />
                                        <p className="max-w-sm text-sm leading-7 text-app-muted">
                                            No positions have been listed for
                                            this election.
                                        </p>
                                        <p className="public-hand mt-3 rotate-[-2deg] text-base text-app-muted/80">
                                            space reserved
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-10">
                                {election.positions.map(
                                    (position, positionIndex) => (
                                        <section
                                            key={position.id}
                                            className="public-scroll-rise"
                                        >
                                            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                                                <div>
                                                    <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                                                        Position{' '}
                                                        {positionIndex + 1}
                                                    </p>
                                                    <h2 className="mt-2 text-3xl leading-tight font-semibold tracking-[-0.03em] text-app-ink md:text-4xl">
                                                        {position.title}
                                                    </h2>
                                                    {position.description && (
                                                        <p className="mt-3 max-w-2xl text-sm leading-7 text-app-muted">
                                                            {
                                                                position.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="theme-surface rounded-full border border-app-border px-4 py-2 text-xs font-medium tracking-[0.14em] text-app-muted uppercase">
                                                    {position.candidates.length}{' '}
                                                    candidate
                                                    {position.candidates
                                                        .length === 1
                                                        ? ''
                                                        : 's'}
                                                </p>
                                            </div>

                                            {position.candidates.length ===
                                            0 ? (
                                                <div className="public-sketch-card theme-surface rounded-[1.2rem] border border-dashed border-app-border p-5 text-sm leading-7 text-app-muted">
                                                    No candidates listed for
                                                    this position.
                                                </div>
                                            ) : (
                                                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                                    {position.candidates.map(
                                                        (candidate) => (
                                                            <CandidateCard
                                                                key={
                                                                    candidate.id
                                                                }
                                                                candidate={
                                                                    candidate
                                                                }
                                                                resultsVisible={
                                                                    election.results_visible
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </section>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </article>
        </>
    );
}

function ElectionMetric({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: number | string;
}) {
    return (
        <div className="public-sketch-card theme-surface flex items-center gap-4 rounded-[1.2rem] border border-app-border p-4 shadow-[0_14px_45px_rgba(28,24,38,0.045)]">
            <span className="theme-ink-soft grid size-11 place-items-center rounded-full text-app-red [&_svg]:size-5">
                {icon}
            </span>
            <span>
                <span className="block text-2xl font-semibold tracking-[-0.04em] text-app-ink">
                    {value}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium tracking-[0.18em] text-app-muted uppercase">
                    {label}
                </span>
            </span>
        </div>
    );
}

function CandidateCard({
    candidate,
    resultsVisible,
}: {
    candidate: ElectionDetail['positions'][number]['candidates'][number];
    resultsVisible: boolean;
}) {
    const initial = candidate.student_name?.slice(0, 1) ?? '?';

    return (
        <article className="public-sketch-card public-scroll-rise group theme-surface overflow-hidden rounded-[1.25rem] border border-app-border shadow-[0_14px_42px_rgba(28,24,38,0.05)] transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-app-surface">
            <div className="relative aspect-[4/3] overflow-hidden bg-app-surface-muted/70">
                {candidate.poster_url ? (
                    <img
                        src={candidate.poster_url}
                        alt=""
                        className="public-scroll-drift size-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="public-paper-grain flex size-full items-center justify-center">
                        <div
                            className="public-float absolute top-6 right-7 size-18 rounded-full border border-dashed border-app-ink/12"
                            aria-hidden="true"
                        />
                        <span className="text-6xl font-semibold tracking-[-0.06em] text-app-ink/14">
                            {initial}
                        </span>
                    </div>
                )}
                <div
                    className="absolute inset-3 rounded-[0.9rem] border border-white/18"
                    aria-hidden="true"
                />
                {resultsVisible && candidate.votes_count !== null && (
                    <span className="theme-primary-active absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase">
                        <Trophy className="size-4 text-app-brass" />
                        {candidate.votes_count} votes
                    </span>
                )}
            </div>

            <div className="p-5">
                <h3 className="text-xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                    {candidate.student_name}
                </h3>
                <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-app-red uppercase">
                    {candidate.student_number}
                </p>
                {candidate.slogan && (
                    <p className="mt-4 line-clamp-2 border-l border-app-brass pl-4 text-sm leading-6 text-app-muted">
                        {candidate.slogan}
                    </p>
                )}
                {candidate.manifesto && (
                    <div className="mt-4 line-clamp-4 border-t border-app-border pt-4 text-sm leading-6 text-app-muted">
                        <RichTextViewer value={candidate.manifesto} />
                    </div>
                )}
            </div>
        </article>
    );
}
