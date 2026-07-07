import { Form, Head, Link } from '@inertiajs/react';
import {
    Archive,
    CheckCircle2,
    Pencil,
    Play,
    Plus,
    Send,
    StopCircle,
    Vote,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { ElectionPositionFormDialog } from '@/features/elections/components/election-position-form-dialog';
import { ElectionPositionList } from '@/features/elections/components/election-position-list';
import { ElectionResults } from '@/features/elections/components/election-results';
import { ElectionStatusBadge } from '@/features/elections/components/election-status-badge';
import { ElectionVotingWorkspace } from '@/features/elections/components/election-voting-workspace';
import type {
    Election,
    ElectionFormOptions,
    ElectionPermissions,
} from '@/features/elections/types';
import {
    archive,
    close,
    edit,
    index,
    publish,
    start,
} from '@/routes/elections';

export default function ShowElection({
    election,
    options,
    can,
}: {
    election: Election;
    options: ElectionFormOptions;
    can: ElectionPermissions;
}) {
    const setupReady =
        election.positions.length > 0 &&
        election.positions.every((position) =>
            position.candidates.some(
                (candidate) => candidate.status === 'approved',
            ),
        );

    return (
        <>
            <Head title={election.title} />
            <div className="app-page admin-page-reveal flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={election.title}
                        description={`${election.academic_period.name} · ${election.academic_period.academic_year}`}
                    />
                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <>
                                <ElectionPositionFormDialog
                                    election={election}
                                    trigger={
                                        <Button className="theme-primary-action">
                                            <Plus />
                                            Add position
                                        </Button>
                                    }
                                />
                                <Button asChild variant="outline">
                                    <Link href={edit(election.id)}>
                                        <Pencil />
                                        Edit details
                                    </Link>
                                </Button>
                            </>
                        )}
                        {can.publish && (
                            <>
                                <ActionButton
                                    form={publish.form(election.id)}
                                    label="Publish"
                                    icon={<Send />}
                                    disabled={!setupReady}
                                />
                                <ActionButton
                                    form={start.form(election.id)}
                                    label="Start"
                                    icon={<Play />}
                                    disabled={!setupReady}
                                />
                                <ConfirmActionDialog
                                    form={close.form(election.id)}
                                    title="Close election?"
                                    description="Closing an election stops voting for every position."
                                    confirmLabel="Close election"
                                    variant="outline"
                                    trigger={
                                        <Button variant="outline">
                                            <StopCircle />
                                            Close
                                        </Button>
                                    }
                                />
                                <ConfirmActionDialog
                                    form={archive.form(election.id)}
                                    title="Archive election?"
                                    description="Archived elections stay in the dashboard but should no longer be treated as active."
                                    confirmLabel="Archive election"
                                    variant="outline"
                                    trigger={
                                        <Button variant="outline">
                                            <Archive />
                                            Archive
                                        </Button>
                                    }
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="space-y-5">
                        <div className="grid gap-3 md:grid-cols-3">
                            <SetupTile
                                label="Positions"
                                value={election.positions.length}
                                detail="Dynamic election posts"
                                icon={Vote}
                            />
                            <SetupTile
                                label="Candidates"
                                value={election.positions.reduce(
                                    (total, position) =>
                                        total + position.candidates.length,
                                    0,
                                )}
                                detail="Across all positions"
                                icon={Plus}
                            />
                            <SetupTile
                                label="Approved"
                                value={election.positions.reduce(
                                    (total, position) =>
                                        total +
                                        position.candidates.filter(
                                            (candidate) =>
                                                candidate.status === 'approved',
                                        ).length,
                                    0,
                                )}
                                detail="Ready for voting"
                                icon={CheckCircle2}
                            />
                        </div>

                        {election.description && (
                            <Card className="app-panel gap-0 py-0">
                                <CardHeader className="border-b py-4">
                                    <CardTitle>Election overview</CardTitle>
                                </CardHeader>
                                <CardContent className="py-4">
                                    <RichTextViewer
                                        value={election.description}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {can.vote && (
                            <Card className="app-panel gap-0 py-0">
                                <CardHeader className="border-b py-4">
                                    <CardTitle>Voting</CardTitle>
                                    <CardDescription>
                                        Move through eligible positions one at a
                                        time.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="py-4">
                                    <ElectionVotingWorkspace
                                        election={election}
                                        canVote={can.vote ?? false}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <ElectionPositionList
                            election={election}
                            options={options}
                            can={can}
                        />
                        <Card className="app-panel">
                            <CardHeader>
                                <CardTitle>Results</CardTitle>
                                <CardDescription>
                                    Results are shown only when permitted.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {can.view_results ? (
                                    <ElectionResults election={election} />
                                ) : (
                                    <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-6 text-sm text-app-muted">
                                        Results are hidden.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="app-panel h-fit">
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <ElectionStatusBadge status={election.status} />
                            {!setupReady && (
                                <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-3 text-xs leading-5 text-app-muted">
                                    Add at least one position and one approved
                                    candidate per position before publishing or
                                    starting.
                                </div>
                            )}
                            <StatusLine
                                label="Votes cast"
                                value={election.votes_count}
                            />
                            <StatusLine
                                label="Positions"
                                value={election.positions.length}
                            />
                            <StatusLine
                                label="Results"
                                value={
                                    election.results_visible
                                        ? 'Results visible'
                                        : 'Results hidden'
                                }
                            />
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link href={index()}>Back to elections</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function SetupTile({
    label,
    value,
    detail,
    icon: Icon,
}: {
    label: string;
    value: number;
    detail: string;
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
            <p className="mt-1 text-xs text-app-muted">{detail}</p>
        </div>
    );
}

function StatusLine({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="app-panel-muted flex items-center justify-between gap-3 px-3 py-2">
            <span className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                {label}
            </span>
            <span className="font-semibold text-app-ink">{value}</span>
        </div>
    );
}

function ActionButton({
    form,
    label,
    icon,
    disabled = false,
}: {
    form: { action: string; method: 'post' };
    label: string;
    icon: ReactNode;
    disabled?: boolean;
}) {
    return (
        <Form {...form} options={{ preserveScroll: true }}>
            {({ processing }) => (
                <Button disabled={processing || disabled} variant="outline">
                    {icon}
                    {label}
                </Button>
            )}
        </Form>
    );
}

ShowElection.layout = {
    breadcrumbs: [{ title: 'Elections', href: index() }],
};
