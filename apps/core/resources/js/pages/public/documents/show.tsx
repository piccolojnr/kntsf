import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { formatPublicDate } from '@/features/public/content-card';
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

            <article className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
                <Link
                    href={index()}
                    className="mb-8 inline-flex items-center gap-2 text-xs font-black tracking-[0.18em] text-app-teal uppercase dark:text-app-brass"
                >
                    <ArrowLeft className="size-4" />
                    All documents
                </Link>

                <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
                    <div>
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                            {document.category && (
                                <span className="theme-primary-active rounded-md px-3 py-1 text-[10px] font-black tracking-[0.22em] uppercase">
                                    {document.category}
                                </span>
                            )}
                            {document.published_at && (
                                <span className="text-xs font-black tracking-[0.22em] text-app-muted uppercase">
                                    {formatPublicDate(
                                        document.published_at,
                                        true,
                                    )}
                                </span>
                            )}
                        </div>
                        <h1 className="max-w-4xl text-5xl leading-[0.95] font-black tracking-normal md:text-7xl">
                            {document.title}
                        </h1>
                        {document.excerpt && (
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-app-muted">
                                {document.excerpt}
                            </p>
                        )}
                        {document.description && (
                            <div className="mt-10 max-w-3xl border-t border-app-border pt-8">
                                <RichTextViewer
                                    value={document.description}
                                    emptyText="No description provided."
                                />
                            </div>
                        )}
                    </div>

                    <aside className="lg:pt-10">
                        <div className="public-panel p-5 shadow-[10px_10px_0_var(--app-brass)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="theme-primary-active grid size-12 place-items-center rounded-md">
                                    <FileText className="size-6" />
                                </div>
                                <div>
                                    <p className="font-black">Attachments</p>
                                    <p className="text-xs font-semibold text-app-muted">
                                        {document.files.length} public file
                                        {document.files.length === 1 ? '' : 's'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {document.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="rounded-md border border-app-border bg-app-surface-muted p-3"
                                    >
                                        <p className="text-sm font-black break-words">
                                            {file.file_name}
                                        </p>
                                        <p className="mt-1 text-xs font-semibold text-app-muted">
                                            {file.human_size}
                                        </p>
                                        <Button
                                            asChild
                                            size="sm"
                                            className="mt-3 w-full rounded-md bg-app-red text-white hover:bg-[#1c1826] dark:hover:bg-app-brass dark:hover:text-[#1c1826]"
                                        >
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Download className="size-4" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </article>
        </>
    );
}
