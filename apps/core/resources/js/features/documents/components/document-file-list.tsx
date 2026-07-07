import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DocumentFile } from '../types';

export function DocumentFileList({ files }: { files: DocumentFile[] }) {
    if (files.length === 0) {
        return (
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-6 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No files attached
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Attach at least one file before publishing.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-app-border overflow-hidden rounded-[1rem] border border-app-border bg-app-surface">
            {files.map((file) => (
                <div
                    key={file.id}
                    className="flex flex-col gap-3 p-4 transition duration-300 hover:bg-app-surface-muted sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="theme-ink-soft flex size-10 shrink-0 items-center justify-center rounded-full text-app-red">
                            <FileText className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-app-ink">
                                {file.file_name}
                            </p>
                            <p className="text-xs text-app-muted">
                                {file.human_size} · {file.mime_type}
                            </p>
                        </div>
                    </div>

                    <Button asChild size="sm" variant="outline">
                        <a href={file.url} target="_blank" rel="noreferrer">
                            <Download />
                            Download
                        </a>
                    </Button>
                </div>
            ))}
        </div>
    );
}
