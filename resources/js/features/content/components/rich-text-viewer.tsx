import { cn } from '@/lib/utils';

export function RichTextViewer({
    value,
    emptyText = 'No content set.',
    className,
}: {
    value?: string | null;
    emptyText?: string;
    className?: string;
}) {
    const content = value?.trim();

    if (!content) {
        return <p className="text-sm text-muted-foreground">{emptyText}</p>;
    }

    return (
        <div className={cn('space-y-4 text-sm leading-7', className)}>
            {content.split(/\n{2,}/).map((block, index) => (
                <TextBlock block={block} key={`${index}-${block.slice(0, 12)}`} />
            ))}
        </div>
    );
}

function TextBlock({ block }: { block: string }) {
    const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const isList = lines.length > 1 && lines.every((line) => line.startsWith('- '));

    if (isList) {
        return (
            <ul className="list-disc space-y-1 pl-5">
                {lines.map((line) => (
                    <li key={line} className="break-words">
                        {line.replace(/^- /, '')}
                    </li>
                ))}
            </ul>
        );
    }

    return <p className="whitespace-pre-line break-words">{block}</p>;
}
