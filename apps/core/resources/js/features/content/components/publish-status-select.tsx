import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';

const statuses: Array<{ value: PublishStatus; label: string }> = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

type PublishStatusSelectProps = {
    name?: string;
    value?: PublishStatus;
    defaultValue?: PublishStatus;
    placeholder?: string;
    onValueChange?: (value: PublishStatus) => void;
};

export function PublishStatusSelect({
    name = 'status',
    value,
    defaultValue = 'draft',
    placeholder = 'Select status',
    onValueChange,
}: PublishStatusSelectProps) {
    return (
        <Select
            name={name}
            value={value}
            defaultValue={defaultValue}
            onValueChange={(nextValue) =>
                onValueChange?.(nextValue as PublishStatus)
            }
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                        {status.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
