import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, edit, show } from '@/routes/polls';
import type { Paginated, Poll, PollPermissions } from '../types';
import { PollStatusBadge } from './poll-status-badge';

export function PollList({
    polls,
    can,
}: {
    polls: Paginated<Poll>;
    can: PollPermissions;
}) {
    if (polls.data.length === 0) {
        return (
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No polls found
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Create a poll or adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[1rem] border border-app-border bg-app-surface">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Poll
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Votes
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Creator
                            </th>
                            <th className="px-4 py-3 text-right font-semibold tracking-[0.12em] uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {polls.data.map((poll) => (
                            <tr
                                key={poll.id}
                                className="transition duration-200 hover:bg-app-surface-muted"
                            >
                                <td className="px-4 py-3">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-app-ink">
                                            {poll.title}
                                        </p>
                                        <p className="max-w-md truncate text-xs text-app-muted">
                                            {poll.description ?? poll.slug}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <PollStatusBadge poll={poll} />
                                </td>
                                <td className="px-4 py-3 text-app-ink capitalize">
                                    {poll.type.replace('_', ' ')}
                                </td>
                                <td className="px-4 py-3 text-app-muted">
                                    {poll.votes_count}
                                </td>
                                <td className="px-4 py-3 text-app-ink">
                                    {poll.creator.name}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link href={show(poll.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>
                                        {can.update && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link href={edit(poll.id)}>
                                                    <Pencil />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <ConfirmActionDialog
                                                form={destroy.form(poll.id)}
                                                title="Delete poll?"
                                                description={`This will remove "${poll.title}" from normal poll records.`}
                                                confirmLabel="Delete poll"
                                                trigger={
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                }
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
