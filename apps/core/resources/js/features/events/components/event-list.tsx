import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, edit, show } from '@/routes/events';
import type { Event, EventPermissions, Paginated } from '../types';
import { EventFeaturedBadge } from './event-featured-badge';
import { EventStatusBadge } from './event-status-badge';

export function EventList({
    events,
    can,
}: {
    events: Paginated<Event>;
    can: EventPermissions;
}) {
    if (events.data.length === 0) {
        return (
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No events found
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Create an event or adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[1rem] border border-app-border bg-app-surface">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1040px] text-sm">
                    <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Event
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Starts
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Location
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Organizer
                            </th>
                            <th className="px-4 py-3 text-right font-semibold tracking-[0.12em] uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {events.data.map((event) => (
                            <tr
                                key={event.id}
                                className="transition duration-200 hover:bg-app-surface-muted"
                            >
                                <td className="px-4 py-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-app-ink">
                                                {event.title}
                                            </p>
                                            <EventFeaturedBadge
                                                isFeatured={event.is_featured}
                                            />
                                        </div>
                                        <p className="max-w-md truncate text-xs text-app-muted">
                                            {event.excerpt ?? event.slug}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <EventStatusBadge event={event} />
                                </td>
                                <td className="px-4 py-3 text-app-muted">
                                    {formatDate(event.starts_at)}
                                </td>
                                <td className="px-4 py-3 text-app-ink">
                                    {event.location ?? 'Not set'}
                                </td>
                                <td className="px-4 py-3 text-app-ink">
                                    {event.organizer.name}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link href={show(event.id)}>
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
                                                <Link href={edit(event.id)}>
                                                    <Pencil />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <ConfirmActionDialog
                                                form={destroy.form(event.id)}
                                                title="Delete event?"
                                                description={`This will remove "${event.title}" from normal event records.`}
                                                confirmLabel="Delete event"
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

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleDateString();
}
