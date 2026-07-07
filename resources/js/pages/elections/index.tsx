import { Head, Link } from '@inertiajs/react';
import { Archive, CheckCircle2, Crown, Plus, Vote } from 'lucide-react';
import type { ComponentType } from 'react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { ElectionStatusBadge } from '@/features/elections/components/election-status-badge';
import type {
    Election,
    ElectionPermissions,
    Paginated,
} from '@/features/elections/types';
import { create, index, show } from '@/routes/elections';

export default function ElectionsIndex({
    elections,
    overview,
    can,
}: {
    elections: Paginated<Election>;
    overview: {
        total: number;
        active: number;
        closed: number;
        archived: number;
    };
    can: ElectionPermissions;
}) {
    return (
        <>
            <Head title="Elections" />
            <div className="app-page admin-page-reveal flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Elections"
                        description="Manage SRC elections, candidates, and voting."
                    />
                    {can.create && (
                        <Button asChild className="theme-primary-action">
                            <Link href={create()}>
                                <Plus />
                                New election
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Tile label="Total" value={overview.total} icon={Vote} />
                    <Tile
                        label="Active"
                        value={overview.active}
                        icon={CheckCircle2}
                    />
                    <Tile label="Closed" value={overview.closed} icon={Crown} />
                    <Tile
                        label="Archived"
                        value={overview.archived}
                        icon={Archive}
                    />
                </div>

                <section className="app-panel overflow-hidden">
                    <div className="border-b border-app-border p-5">
                        <p className="app-kicker">Election workspace</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-app-ink">
                            Active governance cycles
                        </h2>
                    </div>
                    <div className="p-4">
                        <div className="grid gap-3">
                            {elections.data.map((election) => (
                                <Link
                                    key={election.id}
                                    href={show(election.id)}
                                    className="group app-panel-muted flex items-center justify-between gap-4 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-app-red/35 hover:bg-app-surface"
                                >
                                    <div>
                                        <p className="font-semibold text-app-ink">
                                            {election.title}
                                        </p>
                                        <p className="mt-1 text-sm text-app-muted">
                                            {election.academic_period.name} ·{' '}
                                            {election.votes_count} votes
                                        </p>
                                    </div>
                                    <ElectionStatusBadge
                                        status={election.status}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function Tile({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
}) {
    return (
        <div className="app-panel p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.16em] text-app-muted uppercase">
                    {label}
                </p>
                <Icon className="size-4 text-app-red" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-app-ink tabular-nums">
                {value}
            </p>
        </div>
    );
}

ElectionsIndex.layout = {
    breadcrumbs: [{ title: 'Elections', href: index() }],
};
