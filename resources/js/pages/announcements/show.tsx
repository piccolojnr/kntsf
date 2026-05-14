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
import { AnnouncementFeaturedBadge } from '@/features/announcements/components/announcement-featured-badge';
import { AnnouncementStatusBadge } from '@/features/announcements/components/announcement-status-badge';
import type {
    Announcement,
    AnnouncementPermissions,
} from '@/features/announcements/types';
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to announcements
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                        {can.publish &&
                            announcement.status !== 'published' && (
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
                        {can.archive &&
                            announcement.status !== 'archived' && (
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
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
                    <Card className="gap-0 py-0">
                        {announcement.featured_image_url && (
                            <img
                                src={announcement.featured_image_url}
                                alt=""
                                className="max-h-80 w-full rounded-t-lg object-cover"
                            />
                        )}
                        <CardHeader className="border-b py-4">
                            <CardTitle>Content</CardTitle>
                            <CardDescription>
                                Announcement body as currently stored.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="max-w-none whitespace-pre-wrap py-4 text-sm leading-6">
                            {announcement.content}
                        </CardContent>
                    </Card>

                    <Card className="h-fit gap-0 py-0">
                        <CardHeader className="border-b py-4">
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 py-4">
                            <Detail label="Status">
                                <AnnouncementStatusBadge
                                    announcement={announcement}
                                />
                            </Detail>
                            <Detail label="Visibility">
                                <VisibilityBadge
                                    visibility={announcement.visibility}
                                />
                            </Detail>
                            <Detail label="Featured">
                                {announcement.is_featured ? (
                                    <AnnouncementFeaturedBadge isFeatured />
                                ) : (
                                    'No'
                                )}
                            </Detail>
                            <Detail label="Category">
                                {announcement.category ?? 'Not set'}
                            </Detail>
                            <Detail label="Author">
                                {announcement.author.name}
                            </Detail>
                            <Detail label="Published">
                                {formatDate(announcement.published_at)}
                            </Detail>
                            <Detail label="Archived">
                                {formatDate(announcement.archived_at)}
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

ShowAnnouncement.layout = {
    breadcrumbs: [
        {
            title: 'Announcements',
            href: index(),
        },
    ],
};
