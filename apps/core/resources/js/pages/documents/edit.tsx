import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
import { DocumentForm } from '@/features/documents/components/document-form';
import type { Document, DocumentDefaults } from '@/features/documents/types';
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

            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Edit document"
                        description={document.title}
                    />

                    <Button asChild variant="outline">
                        <Link href={show(document.id)}>
                            <ArrowLeft />
                            Back to details
                        </Link>
                    </Button>
                </ContentToolbar>

                <DocumentForm document={document} defaults={defaults} />
            </ContentPage>
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
