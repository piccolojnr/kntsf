import { Form } from '@inertiajs/react';
import { Save } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { store, update } from '@/routes/elections';
import type { AcademicPeriodOption, Election } from '../types';

export function ElectionForm({
    election,
    academicPeriods,
}: {
    election?: Election;
    academicPeriods: AcademicPeriodOption[];
}) {
    const isEditing = election !== undefined;
    const positions = isEditing
        ? [...election.positions, ...Array.from({ length: 1 }, () => null)]
        : Array.from({ length: 3 }, () => null);

    return (
        <Form
            {...(isEditing ? update.form(election.id) : store.form())}
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={election?.title}
                                    required
                                    placeholder="SRC General Elections"
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={election?.slug}
                                    placeholder="Leave blank to generate"
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={election?.description ?? ''}
                                    rows={5}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="rounded-lg border bg-card p-4">
                                <p className="mb-3 text-sm font-medium">
                                    Positions
                                </p>
                                <div className="space-y-3">
                                    {positions.map((position, index) => (
                                        <div
                                            key={position?.id ?? `new-${index}`}
                                            className="grid gap-2 rounded-md border p-3"
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
                                                defaultValue={
                                                    position?.max_winners ?? 1
                                                }
                                                placeholder="Max winners"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Academic period</Label>
                                        <Select
                                            name="academic_period_id"
                                            defaultValue={election?.academic_period_id.toString()}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicPeriods.map((period) => (
                                                    <SelectItem
                                                        key={period.id}
                                                        value={period.id.toString()}
                                                    >
                                                        {period.name} ·{' '}
                                                        {period.academic_year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.academic_period_id}
                                        />
                                    </div>
                                    <DateInput
                                        id="starts_at"
                                        label="Starts at"
                                        value={election?.starts_at}
                                        error={errors.starts_at}
                                    />
                                    <DateInput
                                        id="ends_at"
                                        label="Ends at"
                                        value={election?.ends_at}
                                        error={errors.ends_at}
                                    />
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-3">
                                        <input
                                            type="hidden"
                                            name="results_visible"
                                            value="0"
                                        />
                                        <Checkbox
                                            id="results_visible"
                                            name="results_visible"
                                            value="1"
                                            defaultChecked={
                                                election?.results_visible ?? false
                                            }
                                        />
                                        <Label htmlFor="results_visible">
                                            Results visible
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            <Save />
                            {isEditing ? 'Save changes' : 'Create election'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

function DateInput({
    id,
    label,
    value,
    error,
}: {
    id: string;
    label: string;
    value?: string | null;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={id}
                type="datetime-local"
                defaultValue={toDatetimeLocal(value)}
            />
            <InputError message={error} />
        </div>
    );
}

function toDatetimeLocal(value?: string | null) {
    return value ? new Date(value).toISOString().slice(0, 16) : '';
}
