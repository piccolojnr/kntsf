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
                    className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0f5b45] dark:text-[#d8a329]"
                >
                    <ArrowLeft className="size-4" />
                    All documents
                </Link>

                <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
                    <div>
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                            {document.category && (
                                <span className="bg-[#17211b] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f5ead2] dark:bg-[#f5ead2] dark:text-[#17211b]">
                                    {document.category}
                                </span>
                            )}
                            {document.published_at && (
                                <span className="text-xs font-black uppercase tracking-[0.22em] text-[#596257] dark:text-[#b8c3b8]">
                                    {formatPublicDate(document.published_at, true)}
                                </span>
                            )}
                        </div>
                        <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                            {document.title}
                        </h1>
                        {document.excerpt && (
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#596257] dark:text-[#b8c3b8]">
                                {document.excerpt}
                            </p>
                        )}
                        {document.description && (
                            <div className="mt-10 max-w-3xl border-t border-[#1f2a24]/10 pt-8 dark:border-white/10">
                                <RichTextViewer
                                    value={document.description}
                                    emptyText="No description provided."
                                />
                            </div>
                        )}
                    </div>

                    <aside className="lg:pt-10">
                        <div className="border border-[#17211b] bg-[#fffaf0] p-5 shadow-[10px_10px_0_#d8a329] dark:border-white/10 dark:bg-[#111712]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="grid size-12 place-items-center bg-[#17211b] text-[#f5ead2]">
                                    <FileText className="size-6" />
                                </div>
                                <div>
                                    <p className="font-black">Attachments</p>
                                    <p className="text-xs font-semibold text-[#596257] dark:text-[#b8c3b8]">
                                        {document.files.length} public file
                                        {document.files.length === 1 ? '' : 's'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {document.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="border border-[#1f2a24]/10 bg-[#f7f0df] p-3 dark:border-white/10 dark:bg-[#0b100d]"
                                    >
                                        <p className="break-words text-sm font-black">
                                            {file.file_name}
                                        </p>
                                        <p className="mt-1 text-xs font-semibold text-[#596257] dark:text-[#b8c3b8]">
                                            {file.human_size}
                                        </p>
                                        <Button
                                            asChild
                                            size="sm"
                                            className="mt-3 w-full rounded-none bg-[#b7352d] text-white hover:bg-[#17211b]"
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
