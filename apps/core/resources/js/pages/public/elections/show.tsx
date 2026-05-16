import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Trophy, Vote } from 'lucide-react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { index } from '@/routes/public/elections';
import type { ElectionDetail } from '../types';

const statusStyles: Record<string, string> = {
    active: 'bg-[#0f5b45] text-white',
    scheduled: 'bg-[#d8a329] text-[#17211b]',
    closed: 'bg-[#17211b] text-[#f5ead2]',
    archived: 'bg-[#596257] text-white',
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
                    className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0f5b45] dark:text-[#d8a329]"
                >
                    <ArrowLeft className="size-4" />
                    All elections
                </Link>

                <section className="border border-[#17211b] bg-[#efe3c6] p-6 shadow-[14px_14px_0_#d8a329] dark:border-white/10 dark:bg-[#111712] md:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${statusStyle}`}
                        >
                            {election.status}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#596257] dark:text-[#b8c3b8]">
                            <CalendarDays className="size-4" />
                            {election.academic_period.name} /{' '}
                            {election.academic_period.academic_year}
                        </span>
                    </div>
                    <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                        {election.title}
                    </h1>
                    {election.description && (
                        <div className="mt-7 max-w-3xl text-[#596257] dark:text-[#b8c3b8]">
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
                    <div className="mt-14 grid min-h-72 place-items-center border border-dashed border-[#1f2a24]/25 text-center dark:border-white/15">
                        <div>
                            <Vote className="mx-auto mb-4 size-10 text-[#0f5b45] dark:text-[#d8a329]" />
                            <p className="font-semibold text-[#596257] dark:text-[#b8c3b8]">
                                No positions have been listed for this election.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-16 space-y-16">
                        {election.positions.map((position, positionIndex) => (
                            <section key={position.id}>
                                <div className="mb-6 flex flex-col justify-between gap-3 border-b border-[#1f2a24]/10 pb-5 md:flex-row md:items-end dark:border-white/10">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b7352d]">
                                            Position {positionIndex + 1}
                                        </p>
                                        <h2 className="mt-2 text-4xl font-black tracking-normal">
                                            {position.title}
                                        </h2>
                                        {position.description && (
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596257] dark:text-[#b8c3b8]">
                                                {position.description}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#596257] dark:text-[#b8c3b8]">
                                        {position.candidates.length} candidate
                                        {position.candidates.length === 1 ? '' : 's'}
                                    </p>
                                </div>

                                {position.candidates.length === 0 ? (
                                    <p className="text-sm italic text-[#596257] dark:text-[#b8c3b8]">
                                        No candidates listed for this position.
                                    </p>
                                ) : (
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {position.candidates.map((candidate) => (
                                            <article
                                                key={candidate.id}
                                                className="group overflow-hidden border border-[#1f2a24]/10 bg-[#fffaf0] dark:border-white/10 dark:bg-[#111712]"
                                            >
                                                <div className="relative aspect-[4/5] overflow-hidden bg-[#efe3c6] dark:bg-[#1b241d]">
                                                    {candidate.poster_url ? (
                                                        <img
                                                            src={candidate.poster_url}
                                                            alt=""
                                                            className="size-full object-cover transition duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="grid size-full place-items-center">
                                                            <span className="text-7xl font-black text-[#0f5b45]/20 dark:text-[#d8a329]/30">
                                                                {candidate.student_name?.slice(
                                                                    0,
                                                                    1,
                                                                ) ?? '?'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {candidate.votes_count !== null && (
                                                        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-[#17211b] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#f5ead2]">
                                                            <Trophy className="size-4 text-[#d8a329]" />
                                                            {candidate.votes_count} votes
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="text-2xl font-black leading-tight">
                                                        {candidate.student_name}
                                                    </h3>
                                                    <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#b7352d]">
                                                        {candidate.student_number}
                                                    </p>
                                                    {candidate.slogan && (
                                                        <p className="mt-4 border-l-4 border-[#d8a329] pl-4 text-sm font-semibold italic leading-6 text-[#596257] dark:text-[#b8c3b8]">
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
        <div className="border border-[#1f2a24]/10 bg-[#fffaf0] p-4 dark:border-white/10 dark:bg-[#0b100d]">
            <p className="text-3xl font-black">{value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#596257] dark:text-[#b8c3b8]">
                {label}
            </p>
        </div>
    );
}
