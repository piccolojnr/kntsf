import InputError from '@/components/shared/input-error';
import { Input } from '@/components/ui/input';

type OptionLike = {
    id?: number;
    text?: string;
};

export function OptionsBuilder({
    name,
    options,
    placeholderPrefix = 'Option',
    error,
}: {
    name: string;
    options: Array<OptionLike | null>;
    placeholderPrefix?: string;
    error?: string;
}) {
    return (
        <div className="space-y-3">
            {options.map((option, index) => (
                <div
                    key={option?.id ?? `new-${index}`}
                    className="rounded-md border bg-background p-3"
                >
                    {option?.id && (
                        <input
                            type="hidden"
                            name={`${name}[${index}][id]`}
                            value={option.id}
                        />
                    )}
                    <Input
                        name={`${name}[${index}][text]`}
                        defaultValue={option?.text ?? ''}
                        placeholder={`${placeholderPrefix} ${index + 1}`}
                    />
                </div>
            ))}
            <InputError message={error} />
        </div>
    );
}
