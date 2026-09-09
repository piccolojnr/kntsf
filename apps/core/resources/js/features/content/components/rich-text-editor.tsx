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
        <div className="overflow-hidden rounded-[1rem] border border-app-border bg-app-surface-muted">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border bg-app-surface px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
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
                    'min-h-48 resize-y rounded-none border-0 bg-transparent text-app-ink shadow-none focus-visible:ring-0',
                    className,
                )}
                {...props}
            />
            {helperText && (
                <div className="border-t border-app-border bg-app-surface px-4 py-3 text-xs leading-5 text-app-muted">
                    {helperText}
                </div>
            )}
        </div>
    );
}
