import { Head } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
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
                {document.image_url && (
                    <img
                        src={document.image_url}
                        alt=""
                        className="mb-6 aspect-video w-full rounded-lg object-cover"
                    />
                )}
                <p className="text-sm text-muted-foreground">
                    {document.category ?? 'Document'}
                </p>
                <h1 className="mt-3 text-3xl font-semibold">{document.title}</h1>
                {document.excerpt && (
                    <p className="mt-3 text-lg leading-8 text-muted-foreground">
                        {document.excerpt}
                    </p>
                )}
                <div className="mt-8">
                    <RichTextViewer
                        value={document.description}
                        emptyText="No description provided."
                    />
                </div>
                <div className="mt-8 space-y-3">
                    {document.files.map((file) => (
                        <div
                            key={file.id}
                            className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{file.file_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {file.human_size}
                                    </p>
                                </div>
                            </div>
                            <Button asChild variant="outline">
                                <a href={file.url} target="_blank" rel="noreferrer">
                                    <Download />
                                    Download
                                </a>
                            </Button>
                        </div>
                    ))}
                </div>
            </article>
        </>
    );
}
