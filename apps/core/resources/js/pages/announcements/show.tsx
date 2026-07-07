import { Form, Head, Link } from '@inertiajs/react';
import { Archive, ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { AnnouncementFeaturedBadge } from '@/features/announcements/components/announcement-featured-badge';
import { AnnouncementStatusBadge } from '@/features/announcements/components/announcement-status-badge';
import type {
    Announcement,
    AnnouncementPermissions,
} from '@/features/announcements/types';
import {
    ContentPage,
    ContentToolbar,
    DetailItem,
    DetailPanel,
} from '@/features/content/components/content-admin-surface';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { VisibilityBadge } from '@/features/content/components/visibility-badge';
import { archive, destroy, edit, index, publish } from '@/routes/announcements';

export default function ShowAnnouncement({
    announcement,
    can,
}: {
    announcement: Announcement;
    can: AnnouncementPermissions;
}) {
    return (
        <>
            <Head title={announcement.title} />

            <ContentPage>
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to announcements
                    </Link>
                </Button>

                <ContentToolbar>
                    <Heading
                        title={announcement.title}
                        description={announcement.excerpt ?? announcement.slug}
                    />

                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <Button asChild variant="outline">
                                <Link href={edit(announcement.id)}>
                                    <Pencil />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {can.publish && announcement.status !== 'published' && (
                            <Form
                                {...publish.form(announcement.id)}
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
                        {can.archive && announcement.status !== 'archived' && (
                            <ConfirmActionDialog
                                form={archive.form(announcement.id)}
                                title="Archive announcement?"
                                description="Archived announcements stay in the dashboard but should no longer be treated as current."
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
                                form={destroy.form(announcement.id)}
                                title="Delete announcement?"
                                description={`This will remove "${announcement.title}" from normal announcement records.`}
                                confirmLabel="Delete announcement"
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
                        title="Content"
                        description="Announcement body as currently stored."
                    >
                        {announcement.featured_image_url && (
                            <img
                                src={announcement.featured_image_url}
                                alt=""
                                className="-mx-5 -mt-5 mb-5 max-h-80 w-[calc(100%+2.5rem)] object-cover"
                            />
                        )}
                        <RichTextViewer value={announcement.content} />
                    </DetailPanel>

                    <DetailPanel title="Publishing" className="h-fit">
                        <div className="space-y-3">
                            <DetailItem label="Status">
                                <AnnouncementStatusBadge
                                    announcement={announcement}
                                />
                            </DetailItem>
                            <DetailItem label="Visibility">
                                <VisibilityBadge
                                    visibility={announcement.visibility}
                                />
                            </DetailItem>
                            <DetailItem label="Featured">
                                {announcement.is_featured ? (
                                    <AnnouncementFeaturedBadge isFeatured />
                                ) : (
                                    'No'
                                )}
                            </DetailItem>
                            <DetailItem label="Category">
                                {announcement.category ?? 'Not set'}
                            </DetailItem>
                            <DetailItem label="Author">
                                {announcement.author.name}
                            </DetailItem>
                            <DetailItem label="Published">
                                {formatDate(announcement.published_at)}
                            </DetailItem>
                            <DetailItem label="Archived">
                                {formatDate(announcement.archived_at)}
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

ShowAnnouncement.layout = {
    breadcrumbs: [
        {
            title: 'Announcements',
            href: index(),
        },
    ],
};
