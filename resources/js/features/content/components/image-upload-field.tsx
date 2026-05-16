import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ImageUploadField({
    id,
    name,
    label,
    description = 'Upload a JPG, PNG, or WebP image.',
    existingUrl,
    error,
}: {
    id: string;
    name: string;
    label: string;
    description?: string;
    existingUrl?: string | null;
    error?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="rounded-md border border-dashed bg-muted/20 p-3">
                {previewUrl ? (
                    <div className="space-y-3">
                        <img
                            src={previewUrl}
                            alt=""
                            className="aspect-video w-full rounded-md object-cover"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                }

                                setPreviewUrl(null);
                            }}
                        >
                            <X />
                            Clear preview
                        </Button>
                    </div>
                ) : (
                    <div className="flex min-h-32 flex-col items-center justify-center rounded-md bg-background p-4 text-center">
                        <ImagePlus className="size-8 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium">No image selected</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    </div>
                )}
                <Input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type="file"
                    accept="image/*"
                    className="mt-3"
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                            setPreviewUrl(existingUrl ?? null);

                            return;
                        }

                        if (objectUrl) {
                            URL.revokeObjectURL(objectUrl);
                        }

                        const nextObjectUrl = URL.createObjectURL(file);
                        setObjectUrl(nextObjectUrl);
                        setPreviewUrl(nextObjectUrl);
                    }}
                />
            </div>
            <InputError message={error} />
        </div>
    );
}
