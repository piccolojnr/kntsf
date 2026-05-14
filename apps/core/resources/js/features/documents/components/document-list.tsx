import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { destroy, edit, show } from '@/routes/documents';
import type { Document, DocumentPermissions, Paginated } from '../types';
import { DocumentStatusBadge } from './document-status-badge';

export function DocumentList({
    documents,
    can,
}: {
    documents: Paginated<Document>;
    can: DocumentPermissions;
}) {
    if (documents.data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No documents found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Upload a document or adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1040px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Document
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Category
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Files
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Author
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {documents.data.map((document) => (
                            <tr
                                key={document.id}
                                className="bg-card hover:bg-muted/30"
                            >
                                <td className="px-4 py-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">
                                                {document.title}
                                            </p>
                                            {document.is_featured && (
                                                <Badge variant="secondary">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="max-w-md truncate text-xs text-muted-foreground">
                                            {document.excerpt ?? document.slug}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <DocumentStatusBadge document={document} />
                                </td>
                                <td className="px-4 py-3">
                                    {document.category ?? 'Not set'}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {document.files.length}
                                </td>
                                <td className="px-4 py-3">
                                    {document.author.name}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={show(document.id)}>
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
                                                <Link href={edit(document.id)}>
                                                    <Pencil />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <ConfirmActionDialog
                                                form={destroy.form(document.id)}
                                                title="Delete document?"
                                                description={`This will remove "${document.title}" from normal document records.`}
                                                confirmLabel="Delete document"
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
