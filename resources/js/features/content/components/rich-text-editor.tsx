import { AlignLeft, Pilcrow } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type RichTextEditorProps = ComponentProps<typeof Textarea> & {
    label?: string;
    name?: string;
    helperText?: string;
};

export function RichTextEditor({
    className,
    defaultValue = '',
    helperText = 'Use short paragraphs. Line breaks and simple lists are preserved when displayed.',
    label,
    name = 'body',
    rows = 8,
    placeholder = 'Write content...',
    ...props
}: RichTextEditorProps) {
    const [value, setValue] = useState(String(defaultValue ?? ''));
    const wordCount = useMemo(() => {
        return value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
    }, [value]);

    return (
        <div className="overflow-hidden rounded-lg border bg-background">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <AlignLeft className="size-4" />
                    {label ?? 'Rich text'}
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                        <Pilcrow className="size-3" />
                        {wordCount} words
                    </Badge>
                </div>
            </div>
            <Textarea
                name={name}
                rows={rows}
                placeholder={placeholder}
                defaultValue={defaultValue}
                onChange={(event) => {
                    setValue(event.target.value);
                    props.onChange?.(event);
                }}
                className={cn(
                    'min-h-48 resize-y rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0',
                    className,
                )}
                {...props}
            />
            {helperText && (
                <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    {helperText}
                </div>
            )}
        </div>
    );
}
