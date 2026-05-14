import InputError from '@/components/shared/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    PublishStatusSelect
    
} from './publish-status-select';
import type {PublishStatus} from './publish-status-select';

export function PublishingSettings({
    status,
    visibility,
    publishedAt,
    isFeatured,
    featuredLabel,
    errors,
}: {
    status: PublishStatus;
    visibility: string;
    publishedAt?: string | null;
    isFeatured: boolean;
    featuredLabel: string;
    errors: Record<string, string | undefined>;
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label>Status</Label>
                <PublishStatusSelect defaultValue={status} />
                <InputError message={errors.status} />
            </div>

            <div className="grid gap-2">
                <Label>Visibility</Label>
                <Select name="visibility" defaultValue={visibility}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors.visibility} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="published_at">Published at</Label>
                <Input
                    id="published_at"
                    name="published_at"
                    type="datetime-local"
                    defaultValue={toDatetimeLocal(publishedAt)}
                />
                <InputError message={errors.published_at} />
            </div>

            <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-3">
                <input type="hidden" name="is_featured" value="0" />
                <Checkbox
                    id="is_featured"
                    name="is_featured"
                    value="1"
                    defaultChecked={isFeatured}
                />
                <Label htmlFor="is_featured">{featuredLabel}</Label>
            </div>
        </>
    );
}

export function toDatetimeLocal(value?: string | null) {
    if (!value) {
        return '';
    }

    return new Date(value).toISOString().slice(0, 16);
}
