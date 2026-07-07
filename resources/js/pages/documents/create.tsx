import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
import { DocumentForm } from '@/features/documents/components/document-form';
import type { DocumentDefaults } from '@/features/documents/types';
import { create, index } from '@/routes/documents';

export default function CreateDocument({
    defaults,
}: {
    defaults: DocumentDefaults;
}) {
    return (
        <>
            <Head title="Create document" />

            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Create document"
                        description="Upload a downloadable document and prepare it for publishing."
                    />

                    <Button asChild variant="outline">
                        <Link href={index()}>
                            <ArrowLeft />
                            Back to documents
                        </Link>
                    </Button>
                </ContentToolbar>

                <DocumentForm defaults={defaults} />
            </ContentPage>
        </>
    );
}

CreateDocument.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
