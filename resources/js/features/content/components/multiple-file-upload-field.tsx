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
            <div className="rounded-lg border border-dashed bg-muted/20 p-3">
                <div className="flex items-start gap-3 rounded-md bg-background p-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
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
