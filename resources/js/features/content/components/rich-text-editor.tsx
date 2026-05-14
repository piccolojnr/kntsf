import type { ComponentProps } from 'react';
import { Textarea } from '@/components/ui/textarea';

type RichTextEditorProps = ComponentProps<typeof Textarea> & {
    name?: string;
};

export function RichTextEditor({
    name = 'body',
    rows = 8,
    placeholder = 'Write content...',
    ...props
}: RichTextEditorProps) {
    return (
        <Textarea
            name={name}
            rows={rows}
            placeholder={placeholder}
            {...props}
        />
    );
}
