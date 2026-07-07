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
                backgroundImageUrl="/images/campus-moment.jpg"
            />
            <section className="theme-paper relative overflow-hidden">
                <div
                    className="theme-ink-soft absolute top-16 right-[7%] size-52 rounded-full blur-3xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-18">
                    <aside className="lg:pt-3">
                        <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                            Records desk
                        </p>
                        <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                            Filed for public access
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-app-muted">
                            Policies, forms, minutes, and reports stay arranged
                            here for students to find quickly.
                        </p>
                        <p className="public-hand public-scroll-mark mt-6 rotate-[-2deg] text-base text-app-muted">
                            filed neatly
                        </p>
                    </aside>

                    <div>
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {items.length === 0 ? (
                                <PublicContentEmpty
                                    icon={<FileText className="size-8" />}
                                    message="No documents have been published yet. This archive space is ready for the first public file."
                                />
                            ) : (
                                items.map((document) => (
                                    <PublicContentCard
                                        key={document.id}
                                        title={document.title}
                                        description={document.excerpt}
                                        imageUrl={document.image_url}
                                        meta={formatPublicDate(
                                            document.published_at,
                                        )}
                                        category={document.category}
                                        href={show(document.slug)}
                                        tone="ink"
                                    />
                                ))
                            )}
                        </div>
                        <PublicPagination links={documents.links} />
                    </div>
                </div>
            </section>
        </>
    );
}
