import { Head } from '@inertiajs/react';
import { PublicContentCard } from '@/features/public/content-card';
import { show } from '@/routes/public/documents';
import type { DocumentSummary, Paginated } from '../types';

export default function PublicDocumentsIndex({
    documents,
}: {
    documents: Paginated<DocumentSummary>;
}) {
    return (
        <>
            <Head title="Documents" />
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold">Documents</h1>
                    <p className="mt-2 text-muted-foreground">
                        Public downloadable SRC documents.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {documents.data.map((document) => (
                        <PublicContentCard
                            key={document.id}
                            title={document.title}
                            description={document.excerpt}
                            imageUrl={document.image_url}
                            meta={document.category}
                            href={show(document.slug)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
