import InputError from '@/components/shared/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SlugField({
    defaultValue,
    error,
}: {
    defaultValue?: string | null;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
                id="slug"
                name="slug"
                defaultValue={defaultValue ?? ''}
                maxLength={255}
                placeholder="Leave blank to generate from title"
            />
            <p className="text-xs leading-5 text-app-muted">
                Use this only when the public URL needs a specific readable
                address.
            </p>
            <InputError message={error} />
        </div>
    );
}
