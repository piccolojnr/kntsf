import InputError from '@/components/shared/input-error';
import { Input } from '@/components/ui/input';
import type { ElectionPosition } from '../types';

export function ElectionPositionBuilder({
    positions,
    error,
}: {
    positions: Array<ElectionPosition | null>;
    error?: string;
}) {
    return (
        <div className="space-y-3">
            {positions.map((position, index) => (
                <div
                    key={position?.id ?? `new-${index}`}
                    className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_8rem]"
                >
                    {position?.id && (
                        <input
                            type="hidden"
                            name={`positions[${index}][id]`}
                            value={position.id}
                        />
                    )}
                    <Input
                        name={`positions[${index}][title]`}
                        defaultValue={position?.title ?? ''}
                        placeholder={`Position ${index + 1}`}
                    />
                    <Input
                        name={`positions[${index}][max_winners]`}
                        type="number"
                        min={1}
                        defaultValue={position?.max_winners ?? 1}
                        placeholder="Winners"
                    />
                </div>
            ))}
            <InputError message={error} />
        </div>
    );
}
