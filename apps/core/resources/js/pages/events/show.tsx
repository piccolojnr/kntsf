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
import { EventFeaturedBadge } from '@/features/events/components/event-featured-badge';
import { EventStatusBadge } from '@/features/events/components/event-status-badge';
import type { Event, EventPermissions } from '@/features/events/types';
import { archive, destroy, edit, index, publish } from '@/routes/events';

export default function ShowEvent({
    event,
    can,
}: {
    event: Event;
    can: EventPermissions;
}) {
    return (
        <>
            <Head title={event.title} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to events
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={event.title}
                        description={event.excerpt ?? event.slug}
                    />

                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <Button asChild variant="outline">
                                <Link href={edit(event.id)}>
                                    <Pencil />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {can.publish && event.status !== 'published' && (
                            <Form
                                {...publish.form(event.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button disabled={processing}>
                                        <Send />
                                        Publish
                                    </Button>
                                )}
                            </Form>
                        )}
                        {can.archive && event.status !== 'archived' && (
                            <ConfirmActionDialog
                                form={archive.form(event.id)}
                                title="Archive event?"
                                description="Archived events stay in the dashboard but should no longer be treated as current."
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
                                form={destroy.form(event.id)}
                                title="Delete event?"
                                description={`This will remove "${event.title}" from normal event records.`}
                                confirmLabel="Delete event"
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
                    <Card className="gap-0 py-0">
                        {event.banner_url && (
                            <img
                                src={event.banner_url}
                                alt=""
                                className="max-h-80 w-full rounded-t-lg object-cover"
                            />
                        )}
                        <CardHeader className="border-b py-4">
                            <CardTitle>Description</CardTitle>
                            <CardDescription>
                                Event details as currently stored.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="max-w-none whitespace-pre-wrap py-4 text-sm leading-6">
                            {event.description}
                        </CardContent>
                    </Card>

                    <Card className="h-fit gap-0 py-0">
                        <CardHeader className="border-b py-4">
                            <CardTitle>Event details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 py-4">
                            <Detail label="Status">
                                <EventStatusBadge event={event} />
                            </Detail>
                            <Detail label="Visibility">
                                <VisibilityBadge visibility={event.visibility} />
                            </Detail>
                            <Detail label="Featured">
                                {event.is_featured ? (
                                    <EventFeaturedBadge isFeatured />
                                ) : (
                                    'No'
                                )}
                            </Detail>
                            <Detail label="Starts">
                                {formatDate(event.starts_at)}
                            </Detail>
                            <Detail label="Ends">
                                {formatDate(event.ends_at)}
                            </Detail>
                            <Detail label="Location">
                                {event.location ?? 'Not set'}
                            </Detail>
                            <Detail label="Category">
                                {event.category ?? 'Not set'}
                            </Detail>
                            <Detail label="Capacity">
                                {event.max_attendees === null
                                    ? 'Unlimited'
                                    : `${event.current_attendees} / ${event.max_attendees}`}
                            </Detail>
                            <Detail label="Organizer">
                                {event.organizer.name}
                            </Detail>
                            <Detail label="Published">
                                {formatDate(event.published_at)}
                            </Detail>
                            <Detail label="Archived">
                                {formatDate(event.archived_at)}
                            </Detail>
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
            <div className="mt-1 text-sm font-medium">{children}</div>
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}

ShowEvent.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: index(),
        },
    ],
};
