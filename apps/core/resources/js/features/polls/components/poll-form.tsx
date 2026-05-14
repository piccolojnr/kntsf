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
import { PublishStatusSelect } from '@/features/content/components/publish-status-select';
import { store, update } from '@/routes/polls';
import type { Poll, PollDefaults } from '../types';

export function PollForm({
    poll,
    defaults,
}: {
    poll?: Poll;
    defaults: PollDefaults;
}) {
    const isEditing = poll !== undefined;
    const options = isEditing
        ? [...poll.options, ...Array.from({ length: 2 }, () => null)]
        : Array.from({ length: 4 }, () => null);

    return (
        <Form
            {...(isEditing ? update.form(poll.id) : store.form())}
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
                                    defaultValue={poll?.title}
                                    required
                                    maxLength={255}
                                    placeholder="Poll title"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={poll?.slug}
                                    maxLength={255}
                                    placeholder="Leave blank to generate from title"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={poll?.description ?? ''}
                                    rows={5}
                                    placeholder="What should voters know?"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="rounded-lg border bg-card p-4">
                                <div className="mb-3">
                                    <p className="text-sm font-medium">Options</p>
                                    <p className="text-xs text-muted-foreground">
                                        Fixed polls need at least two active options
                                        before publishing.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {options.map((option, index) => (
                                        <div key={option?.id ?? `new-${index}`}>
                                            {option?.id && (
                                                <input
                                                    type="hidden"
                                                    name={`options[${index}][id]`}
                                                    value={option.id}
                                                />
                                            )}
                                            <Input
                                                name={`options[${index}][text]`}
                                                defaultValue={option?.text ?? ''}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.options} />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Select
                                            name="type"
                                            defaultValue={poll?.type ?? defaults.type}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed_options">
                                                    Fixed options
                                                </SelectItem>
                                                <SelectItem value="dynamic_options">
                                                    Dynamic options
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.type} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <PublishStatusSelect
                                            defaultValue={
                                                poll?.status ?? defaults.status
                                            }
                                        />
                                        <InputError message={errors.status} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Visibility</Label>
                                        <Select
                                            name="visibility"
                                            defaultValue={
                                                poll?.visibility ??
                                                defaults.visibility
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">
                                                    Public
                                                </SelectItem>
                                                <SelectItem value="internal">
                                                    Internal
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.visibility} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="starts_at">Starts at</Label>
                                        <Input
                                            id="starts_at"
                                            name="starts_at"
                                            type="datetime-local"
                                            defaultValue={toDatetimeLocal(
                                                poll?.starts_at,
                                            )}
                                        />
                                        <InputError message={errors.starts_at} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="ends_at">Ends at</Label>
                                        <Input
                                            id="ends_at"
                                            name="ends_at"
                                            type="datetime-local"
                                            defaultValue={toDatetimeLocal(
                                                poll?.ends_at,
                                            )}
                                        />
                                        <InputError message={errors.ends_at} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-3">
                                    <ToggleField
                                        id="show_results"
                                        label="Show results"
                                        defaultChecked={
                                            poll?.show_results ??
                                            defaults.show_results
                                        }
                                    />
                                    <ToggleField
                                        id="allow_vote_change"
                                        label="Allow vote changes"
                                        defaultChecked={
                                            poll?.allow_vote_change ??
                                            defaults.allow_vote_change
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            <Save />
                            {isEditing ? 'Save changes' : 'Create poll'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

function ToggleField({
    id,
    label,
    defaultChecked,
}: {
    id: string;
    label: string;
    defaultChecked: boolean;
}) {
    return (
        <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-3">
            <input type="hidden" name={id} value="0" />
            <Checkbox id={id} name={id} value="1" defaultChecked={defaultChecked} />
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}

function toDatetimeLocal(value?: string | null) {
    if (!value) {
        return '';
    }

    return new Date(value).toISOString().slice(0, 16);
}
