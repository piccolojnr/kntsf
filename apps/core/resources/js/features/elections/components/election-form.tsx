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
import { ContentFormShell } from '@/features/content/components/content-form-shell';
import { FormSection } from '@/features/content/components/form-section';
import { SlugField } from '@/features/content/components/slug-field';
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

    return (
        <Form
            {...(isEditing ? update.form(election.id) : store.form())}
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <ContentFormShell
                        main={
                            <>
                                <FormSection
                                    title="Election content"
                                    description="Set the public election information shown to voters and managers."
                                >
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

                                    <SlugField
                                        defaultValue={election?.slug}
                                        error={errors.slug}
                                    />

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            defaultValue={
                                                election?.description ?? ''
                                            }
                                            rows={6}
                                            placeholder="Election scope, eligibility, and instructions"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>
                                </FormSection>

                            </>
                        }
                        sidebar={
                            <FormSection
                                title="Schedule and access"
                                description="Elections belong to an academic period and can expose results when ready."
                            >
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
                            </FormSection>
                        }
                    />
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
