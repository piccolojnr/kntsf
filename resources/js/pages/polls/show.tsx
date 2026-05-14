import { Form, Head, Link } from '@inertiajs/react';
import { Archive, ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
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
import { VisibilityBadge } from '@/features/content/components/visibility-badge';
import { PollResults } from '@/features/polls/components/poll-results';
import { PollStatusBadge } from '@/features/polls/components/poll-status-badge';
import { PollVotePanel } from '@/features/polls/components/poll-vote-panel';
import type { Poll, PollPermissions } from '@/features/polls/types';
import { archive, destroy, edit, index, publish } from '@/routes/polls';

export default function ShowPoll({
    poll,
    can,
}: {
    poll: Poll;
    can: PollPermissions;
}) {
    return (
        <>
            <Head title={poll.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to polls
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={poll.title}
                        description={poll.description ?? poll.slug}
                    />
                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <Button asChild variant="outline">
                                <Link href={edit(poll.id)}>
                                    <Pencil />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {can.publish && poll.status !== 'published' && (
                            <Form
                                {...publish.form(poll.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing, errors }) => (
                                    <div>
                                        <Button disabled={processing}>
                                            <Send />
                                            Publish
                                        </Button>
                                        {errors.options && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.options}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </Form>
                        )}
                        {can.archive && poll.status !== 'archived' && (
                            <ConfirmActionDialog
                                form={archive.form(poll.id)}
                                title="Archive poll?"
                                description="Archived polls can no longer receive votes."
                                confirmLabel="Archive"
                                variant="outline"
                                trigger={
                                    <Button variant="outline">
                                        <Archive />
                                        Archive
                                    </Button>
                                }
                            />
                        )}
                        {can.delete && (
                            <ConfirmActionDialog
                                form={destroy.form(poll.id)}
                                title="Delete poll?"
                                description={`This will remove "${poll.title}" from normal poll records.`}
                                confirmLabel="Delete poll"
                                trigger={
                                    <Button variant="destructive">
                                        <Trash2 />
                                        Delete
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
                    <div className="space-y-4">
                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b py-4">
                                <CardTitle>Vote</CardTitle>
                                <CardDescription>
                                    Student accounts can vote once unless vote
                                    changes are enabled.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-4">
                                <PollVotePanel
                                    poll={poll}
                                    canVote={can.vote ?? false}
                                />
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b py-4">
                                <CardTitle>Results</CardTitle>
                                <CardDescription>
                                    Results follow the poll visibility setting.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-4">
                                {can.view_results ? (
                                    <PollResults poll={poll} />
                                ) : (
                                    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                                        Results are hidden.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-fit gap-0 py-0">
                        <CardHeader className="border-b py-4">
                            <CardTitle>Poll details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 py-4">
                            <Detail label="Status">
                                <PollStatusBadge poll={poll} />
                            </Detail>
                            <Detail label="Visibility">
                                <VisibilityBadge visibility={poll.visibility} />
                            </Detail>
                            <Detail label="Type">
                                {poll.type.replace('_', ' ')}
                            </Detail>
                            <Detail label="Votes">{poll.votes_count}</Detail>
                            <Detail label="Starts">
                                {formatDate(poll.starts_at)}
                            </Detail>
                            <Detail label="Ends">{formatDate(poll.ends_at)}</Detail>
                            <Detail label="Creator">{poll.creator.name}</Detail>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Detail({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm font-medium capitalize">{children}</div>
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}

ShowPoll.layout = {
    breadcrumbs: [{ title: 'Polls', href: index() }],
};
