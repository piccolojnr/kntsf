import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DocumentFile } from '../types';

export function DocumentFileList({ files }: { files: DocumentFile[] }) {
    if (files.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                <p className="text-sm font-medium">No files attached</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Attach at least one file before publishing.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y rounded-lg border bg-card">
            {files.map((file) => (
                <div
                    key={file.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FileText className="size-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {file.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
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
