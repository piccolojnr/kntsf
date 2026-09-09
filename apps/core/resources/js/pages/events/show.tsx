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

            <ContentPage>
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to events
                    </Link>
                </Button>

                <ContentToolbar>
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
                </ContentToolbar>

                <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
                    <DetailPanel
                        title="Description"
                        description="Event details as currently stored."
                    >
                        {event.banner_url && (
                            <img
                                src={event.banner_url}
                                alt=""
                                className="-mx-5 -mt-5 mb-5 max-h-80 w-[calc(100%+2.5rem)] object-cover"
                            />
                        )}
                        <RichTextViewer value={event.description} />
                    </DetailPanel>

                    <DetailPanel title="Event details" className="h-fit">
                        <div className="space-y-3">
                            <DetailItem label="Status">
                                <EventStatusBadge event={event} />
                            </DetailItem>
                            <DetailItem label="Visibility">
                                <VisibilityBadge
                                    visibility={event.visibility}
                                />
                            </DetailItem>
                            <DetailItem label="Featured">
                                {event.is_featured ? (
                                    <EventFeaturedBadge isFeatured />
                                ) : (
                                    'No'
                                )}
                            </DetailItem>
                            <DetailItem label="Starts">
                                {formatDate(event.starts_at)}
                            </DetailItem>
                            <DetailItem label="Ends">
                                {formatDate(event.ends_at)}
                            </DetailItem>
                            <DetailItem label="Location">
                                {event.location ?? 'Not set'}
                            </DetailItem>
                            <DetailItem label="Category">
                                {event.category ?? 'Not set'}
                            </DetailItem>
                            <DetailItem label="Capacity">
                                {event.max_attendees === null
                                    ? 'Unlimited'
                                    : `${event.current_attendees} / ${event.max_attendees}`}
                            </DetailItem>
                            <DetailItem label="Organizer">
                                {event.organizer.name}
                            </DetailItem>
                            <DetailItem label="Published">
                                {formatDate(event.published_at)}
                            </DetailItem>
                            <DetailItem label="Archived">
                                {formatDate(event.archived_at)}
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

ShowEvent.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: index(),
        },
    ],
};
