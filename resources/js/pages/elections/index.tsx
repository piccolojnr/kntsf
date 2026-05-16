import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    overview: { total: number; active: number; closed: number; archived: number };
    can: ElectionPermissions;
}) {
    return (
        <>
            <Head title="Elections" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Elections"
                        description="Manage SRC elections, candidates, and voting."
                    />
                    {can.create && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New election
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                    <Tile label="Total" value={overview.total} />
                    <Tile label="Active" value={overview.active} />
                    <Tile label="Closed" value={overview.closed} />
                    <Tile label="Archived" value={overview.archived} />
                </div>
                <Card>
                    <CardContent className="p-4">
                        <div className="divide-y rounded-md border">
                            {elections.data.map((election) => (
                                <Link
                                    key={election.id}
                                    href={show(election.id)}
                                    className="flex items-center justify-between gap-4 p-4 hover:bg-muted/30"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {election.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
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
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Tile({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}

ElectionsIndex.layout = {
    breadcrumbs: [{ title: 'Elections', href: index() }],
};
