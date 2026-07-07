import { Form, Head, Link } from '@inertiajs/react';
import { Archive, ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
    DetailItem,
    DetailPanel,
} from '@/features/content/components/content-admin-surface';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
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
            <ContentPage>
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to polls
                    </Link>
                </Button>

                <ContentToolbar>
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
                </ContentToolbar>

                <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
                    <div className="space-y-4">
                        {poll.description && (
                            <DetailPanel title="About this poll">
                                <RichTextViewer value={poll.description} />
                            </DetailPanel>
                        )}

                        <DetailPanel
                            title="Vote"
                            description="Student accounts can vote once unless vote changes are enabled."
                        >
                            <PollVotePanel
                                poll={poll}
                                canVote={can.vote ?? false}
                            />
                        </DetailPanel>

                        <DetailPanel
                            title="Results"
                            description="Results follow the poll visibility setting."
                        >
                            {can.view_results ? (
                                <PollResults poll={poll} />
                            ) : (
                                <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-6 text-sm text-app-muted">
                                    Results are hidden.
                                </div>
                            )}
                        </DetailPanel>
                    </div>

                    <DetailPanel title="Poll details" className="h-fit">
                        <div className="space-y-3">
                            <DetailItem label="Status">
                                <PollStatusBadge poll={poll} />
                            </DetailItem>
                            <DetailItem label="Visibility">
                                <VisibilityBadge visibility={poll.visibility} />
                            </DetailItem>
                            <DetailItem label="Type" className="capitalize">
                                {poll.type.replace('_', ' ')}
                            </DetailItem>
                            <DetailItem label="Votes">
                                {poll.votes_count}
                            </DetailItem>
                            <DetailItem label="Starts">
                                {formatDate(poll.starts_at)}
                            </DetailItem>
                            <DetailItem label="Ends">
                                {formatDate(poll.ends_at)}
                            </DetailItem>
                            <DetailItem label="Creator">
                                {poll.creator.name}
                            </DetailItem>
                        </div>
                    </DetailPanel>
                </div>
            </ContentPage>
        </>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}

ShowPoll.layout = {
    breadcrumbs: [{ title: 'Polls', href: index() }],
};
