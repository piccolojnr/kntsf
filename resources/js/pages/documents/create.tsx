import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                </div>

                <DocumentForm defaults={defaults} />
            </div>
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
