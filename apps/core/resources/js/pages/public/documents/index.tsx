import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { PublicContentCard, PublicContentEmpty } from '@/features/public/content-card';
import { show } from '@/routes/public/documents';
import type { DocumentSummary, Paginated } from '../types';

export default function PublicDocumentsIndex({
    documents,
}: {
    documents: Paginated<DocumentSummary>;
}) {
    const items = documents.data;

    return (
        <>
            <Head title="Documents" />

            {/* Page header */}
            <div className="border-b bg-muted/30">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                        SRC Portal
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Documents</h1>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Official SRC documents available for public download — policies, minutes, reports, and more.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {items.length === 0 ? (
                        <PublicContentEmpty
                            icon={<FileText className="size-8" />}
                            message="No documents have been published yet."
                        />
                    ) : (
                        items.map((document) => (
                            <PublicContentCard
                                key={document.id}
                                title={document.title}
                                description={document.excerpt}
                                imageUrl={document.image_url}
                                meta={formatDate(document.published_at)}
                                category={document.category}
                                href={show(document.slug)}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

function formatDate(value: string | null) {
    return value
        ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;
}
