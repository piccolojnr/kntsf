import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { DocumentForm } from '@/features/documents/components/document-form';
import type {
    Document,
    DocumentDefaults,
} from '@/features/documents/types';
import { edit, index, show } from '@/routes/documents';

export default function EditDocument({
    document,
    defaults,
}: {
    document: Document;
    defaults: DocumentDefaults;
}) {
    return (
        <>
            <Head title={`Edit ${document.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading title="Edit document" description={document.title} />

                    <Button asChild variant="outline">
                        <Link href={show(document.id)}>
                            <ArrowLeft />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <DocumentForm document={document} defaults={defaults} />
            </div>
        </>
    );
}

EditDocument.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href: index(),
        },
        {
            title: 'Edit',
            href: edit(0),
        },
    ],
};
