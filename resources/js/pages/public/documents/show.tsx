import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { index } from '@/routes/public/documents';
import type { DocumentDetail } from '../types';

export default function PublicDocumentShow({
    document,
}: {
    document: DocumentDetail;
}) {
    return (
        <>
            <Head>
                <title>{document.title}</title>
                <meta
                    name="description"
                    content={document.excerpt ?? document.title}
                />
            </Head>

            <article className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
                {/* Back link */}
                <Link
                    href={index()}
                    className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-3.5" />
                    All documents
                </Link>

                {/* Featured image */}
                {document.image_url && (
                    <img
                        src={document.image_url}
                        alt=""
                        className="mb-8 aspect-video w-full rounded-lg object-cover"
                    />
                )}

                {/* Meta */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {document.category && (
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                            {document.category}
                        </span>
                    )}
                    {document.published_at && (
                        <span className="text-xs text-muted-foreground">
                            {formatDate(document.published_at)}
                        </span>
                    )}
                    {document.author && (
                        <span className="text-xs text-muted-foreground">
                            · {document.author.name}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                    {document.title}
                </h1>

                {/* Excerpt */}
                {document.excerpt && (
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        {document.excerpt}
                    </p>
                )}

                {/* Description */}
                {document.description && (
                    <>
                        <hr className="my-8" />
                        <RichTextViewer value={document.description} emptyText="No description provided." />
                    </>
                )}

                {/* File attachments */}
                {document.files.length > 0 && (
                    <div className="mt-10">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Attachments ({document.files.length})
                        </p>
                        <div className="space-y-3">
                            {document.files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                                            <FileText className="size-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{file.file_name}</p>
                                            <p className="text-xs text-muted-foreground">{file.human_size}</p>
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="shrink-0">
                                        <a href={file.url} target="_blank" rel="noreferrer">
                                            <Download className="size-3.5" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </>
    );
}

function formatDate(value: string | null) {
    return value
        ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;
}
