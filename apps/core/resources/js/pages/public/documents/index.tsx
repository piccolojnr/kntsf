import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import {
    formatPublicDate,
    PublicContentCard,
    PublicContentEmpty,
    PublicPageHeader,
    PublicPagination,
} from '@/features/public/content-card';
import { show } from '@/routes/public/documents';
import type { DocumentSummary, Paginated } from '../types';

export default function PublicDocumentsIndex({
    documents,
}: {
    documents: Paginated<DocumentSummary>;
}) {
    const items = documents.data ?? [];

    return (
        <>
            <Head title="Documents" />
            <PublicPageHeader
                eyebrow="Public Archive"
                title="Documents"
                description="Download public SRC documents including policies, minutes, reports, forms, and student-facing records."
                count={items.length}
            />
            <section className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                                meta={formatPublicDate(document.published_at)}
                                category={document.category}
                                href={show(document.slug)}
                                tone="ink"
                            />
                        ))
                    )}
                </div>
                <PublicPagination links={documents.links} />
            </section>
        </>
    );
}
