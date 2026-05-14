import { Form, Head, Link } from '@inertiajs/react';
import { Archive, ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import Heading from '@/components/shared/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { VisibilityBadge } from '@/features/content/components/visibility-badge';
import { DocumentFileList } from '@/features/documents/components/document-file-list';
import { DocumentStatusBadge } from '@/features/documents/components/document-status-badge';
import type {
    Document,
    DocumentPermissions,
} from '@/features/documents/types';
import { archive, destroy, edit, index, publish } from '@/routes/documents';

export default function ShowDocument({
    document,
    can,
}: {
    document: Document;
    can: DocumentPermissions;
}) {
    return (
        <>
            <Head title={document.title} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to documents
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={document.title}
                        description={document.excerpt ?? document.slug}
                    />

                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <Button asChild variant="outline">
                                <Link href={edit(document.id)}>
                                    <Pencil />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {can.publish && document.status !== 'published' && (
                            <Form
                                {...publish.form(document.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing, errors }) => (
                                    <div>
                                        <Button disabled={processing}>
                                            <Send />
                                            Publish
                                        </Button>
                                        {errors.files && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.files}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </Form>
                        )}
                        {can.archive && document.status !== 'archived' && (
                            <ConfirmActionDialog
                                form={archive.form(document.id)}
                                title="Archive document?"
                                description="Archived documents stay in the dashboard but should no longer be treated as current."
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
                                form={destroy.form(document.id)}
                                title="Delete document?"
                                description={`This will remove "${document.title}" from normal document records.`}
                                confirmLabel="Delete document"
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
                            {document.featured_image_url && (
                                <img
                                    src={document.featured_image_url}
                                    alt=""
                                    className="max-h-80 w-full rounded-t-lg object-cover"
                                />
                            )}
                            <CardHeader className="border-b py-4">
                                <CardTitle>Description</CardTitle>
                                <CardDescription>
                                    Internal dashboard description for this
                                    downloadable document.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="max-w-none py-4">
                                <RichTextViewer
                                    value={document.description}
                                    emptyText="No description set."
                                />
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b py-4">
                                <CardTitle>Files</CardTitle>
                                <CardDescription>
                                    Attached files available to dashboard users.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-4">
                                <DocumentFileList files={document.files} />
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-fit gap-0 py-0">
                        <CardHeader className="border-b py-4">
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 py-4">
                            <Detail label="Status">
                                <DocumentStatusBadge document={document} />
                            </Detail>
                            <Detail label="Visibility">
                                <VisibilityBadge
                                    visibility={document.visibility}
                                />
                            </Detail>
                            <Detail label="Featured">
                                {document.is_featured ? (
                                    <Badge variant="secondary">Featured</Badge>
                                ) : (
                                    'No'
                                )}
                            </Detail>
                            <Detail label="Category">
                                {document.category ?? 'Not set'}
                            </Detail>
                            <Detail label="Author">
                                {document.author.name}
                            </Detail>
                            <Detail label="Files">
                                {document.files.length}
                            </Detail>
                            <Detail label="Published">
                                {formatDate(document.published_at)}
                            </Detail>
                            <Detail label="Archived">
                                {formatDate(document.archived_at)}
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

ShowDocument.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href: index(),
        },
    ],
};
