import { FileText, Images } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MultipleFileUploadField({
    id,
    name,
    label,
    accept,
    description,
    error,
    variant = 'files',
}: {
    id: string;
    name: string;
    label: string;
    accept: string;
    description: string;
    error?: string;
    variant?: 'files' | 'images';
}) {
    const [fileNames, setFileNames] = useState<string[]>([]);
    const Icon = variant === 'images' ? Images : FileText;

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-3">
                <div className="flex items-start gap-3 rounded-[0.85rem] bg-app-surface p-3">
                    <div className="theme-ink-soft flex size-10 shrink-0 items-center justify-center rounded-full text-app-red">
                        <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-app-ink">
                            {label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-app-muted">
                            {description}
                        </p>
                    </div>
                </div>
                <Input
                    id={id}
                    name={name}
                    type="file"
                    accept={accept}
                    multiple
                    className="mt-3"
                    onChange={(event) => {
                        setFileNames(
                            Array.from(event.target.files ?? []).map(
                                (file) => file.name,
                            ),
                        );
                    }}
                />
                {fileNames.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {fileNames.map((fileName) => (
                            <Badge
                                key={fileName}
                                variant="secondary"
                                className="max-w-full truncate"
                            >
                                {fileName}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
            <InputError message={error} />
        </div>
    );
}
