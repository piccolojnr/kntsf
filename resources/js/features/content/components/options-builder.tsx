import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type OptionLike = {
    id?: number;
    text?: string;
    votes_count?: number | null;
};

export function OptionsBuilder({
    name,
    options,
    minimumRows = 2,
    placeholderPrefix = 'Option',
    error,
}: {
    name: string;
    options: Array<OptionLike | null>;
    minimumRows?: number;
    placeholderPrefix?: string;
    error?: string;
}) {
    const initialRows = useMemo(() => {
        const existingRows = options.map((option, index) => ({
            key: option?.id ? `existing-${option.id}` : `new-${index}`,
            option,
            canRemove: !option?.id,
        }));

        while (existingRows.length < minimumRows) {
            existingRows.push({
                key: `new-${existingRows.length}`,
                option: null,
                canRemove: true,
            });
        }

        return existingRows;
    }, [minimumRows, options]);
    const [rows, setRows] = useState(initialRows);

    return (
        <div className="space-y-3">
            {rows.map((row, index) => (
                <div
                    key={row.key}
                    className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                    {row.option?.id && (
                        <input
                            type="hidden"
                            name={`${name}[${index}][id]`}
                            value={row.option.id}
                        />
                    )}
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor={`${name}_${index}_text`}>
                                {placeholderPrefix} {index + 1}
                            </Label>
                            {row.option?.id && (
                                <span className="text-xs text-muted-foreground">
                                    Saved
                                    {typeof row.option.votes_count === 'number'
                                        ? ` · ${row.option.votes_count} votes`
                                        : ''}
                                </span>
                            )}
                        </div>
                        <Input
                            id={`${name}_${index}_text`}
                            name={`${name}[${index}][text]`}
                            defaultValue={row.option?.text ?? ''}
                            placeholder={`${placeholderPrefix} ${index + 1}`}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="self-end"
                        disabled={!row.canRemove || rows.length <= minimumRows}
                        onClick={() =>
                            setRows((currentRows) =>
                                currentRows.filter(
                                    (currentRow) => currentRow.key !== row.key,
                                ),
                            )
                        }
                    >
                        <Trash2 />
                        <span className="sr-only">
                            Remove {placeholderPrefix.toLowerCase()} {index + 1}
                        </span>
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                onClick={() =>
                    setRows((currentRows) => [
                        ...currentRows,
                        {
                            key: `new-${Date.now()}-${currentRows.length}`,
                            option: null,
                            canRemove: true,
                        },
                    ])
                }
            >
                <Plus />
                Add option
            </Button>
            <InputError message={error} />
        </div>
    );
}
