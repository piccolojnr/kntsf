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
            <div className="rounded-md border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No polls found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a poll or adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-md border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Poll
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Votes
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Creator
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {polls.data.map((poll) => (
                            <tr key={poll.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <div className="space-y-1">
                                        <p className="font-medium">{poll.title}</p>
                                        <p className="max-w-md truncate text-xs text-muted-foreground">
                                            {poll.description ?? poll.slug}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <PollStatusBadge poll={poll} />
                                </td>
                                <td className="px-4 py-3 capitalize">
                                    {poll.type.replace('_', ' ')}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {poll.votes_count}
                                </td>
                                <td className="px-4 py-3">{poll.creator.name}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={show(poll.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>
                                        {can.update && (
                                            <Button asChild size="sm" variant="outline">
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
                                                    <Button size="sm" variant="destructive">
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
