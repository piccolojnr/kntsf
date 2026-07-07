import { Form, Head, Link } from '@inertiajs/react';
import { Archive, ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import Heading from '@/components/shared/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
    DetailItem,
    DetailPanel,
} from '@/features/content/components/content-admin-surface';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { VisibilityBadge } from '@/features/content/components/visibility-badge';
import { DocumentFileList } from '@/features/documents/components/document-file-list';
import { DocumentStatusBadge } from '@/features/documents/components/document-status-badge';
import type { Document, DocumentPermissions } from '@/features/documents/types';
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

            <ContentPage>
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to documents
                    </Link>
                </Button>

                <ContentToolbar>
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
                </ContentToolbar>

                <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
                    <div className="space-y-4">
                        <DetailPanel
                            title="Description"
                            description="Internal dashboard description for this downloadable document."
                        >
                            {document.featured_image_url && (
                                <img
                                    src={document.featured_image_url}
                                    alt=""
                                    className="-mx-5 -mt-5 mb-5 max-h-80 w-[calc(100%+2.5rem)] object-cover"
                                />
                            )}
                            <RichTextViewer
                                value={document.description}
                                emptyText="No description set."
                            />
                        </DetailPanel>

                        <DetailPanel
                            title="Files"
                            description="Attached files available to dashboard users."
                        >
                            <DocumentFileList files={document.files} />
                        </DetailPanel>
                    </div>

                    <DetailPanel title="Publishing" className="h-fit">
                        <div className="space-y-3">
                            <DetailItem label="Status">
                                <DocumentStatusBadge document={document} />
                            </DetailItem>
                            <DetailItem label="Visibility">
                                <VisibilityBadge
                                    visibility={document.visibility}
                                />
                            </DetailItem>
                            <DetailItem label="Featured">
                                {document.is_featured ? (
                                    <Badge variant="secondary">Featured</Badge>
                                ) : (
                                    'No'
                                )}
                            </DetailItem>
                            <DetailItem label="Category">
                                {document.category ?? 'Not set'}
                            </DetailItem>
                            <DetailItem label="Author">
                                {document.author.name}
                            </DetailItem>
                            <DetailItem label="Files">
                                {document.files.length}
                            </DetailItem>
                            <DetailItem label="Published">
                                {formatDate(document.published_at)}
                            </DetailItem>
                            <DetailItem label="Archived">
                                {formatDate(document.archived_at)}
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

ShowDocument.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href: index(),
        },
    ],
};
