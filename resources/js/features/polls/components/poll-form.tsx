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
import { OptionsBuilder } from '@/features/content/components/options-builder';
import { PublishStatusSelect } from '@/features/content/components/publish-status-select';
import { SlugField } from '@/features/content/components/slug-field';
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
    const options = isEditing ? poll.options : Array.from({ length: 4 }, () => null);

    return (
        <Form
            {...(isEditing ? update.form(poll.id) : store.form())}
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <ContentFormShell
                        main={
                            <div className="space-y-5">
                                <FormSection
                                    title="Poll content"
                                    description="Set the question and context voters will see."
                                >
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

                                    <SlugField
                                        defaultValue={poll?.slug}
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
                                                poll?.description ?? ''
                                            }
                                            rows={5}
                                            placeholder="What should voters know?"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Options"
                                    description="Fixed polls need at least two active options before publishing."
                                >
                                    <OptionsBuilder
                                        name="options"
                                        options={options}
                                        minimumRows={2}
                                        error={errors.options}
                                    />
                                </FormSection>
                            </div>
                        }
                        sidebar={
                            <>
                                <FormSection
                                    title="Publishing"
                                    description="Control poll type, timing, and visibility."
                                >
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Select
                                            name="type"
                                            defaultValue={
                                                poll?.type ?? defaults.type
                                            }
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
                                        <Label htmlFor="starts_at">
                                            Starts at
                                        </Label>
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
                                </FormSection>

                                <FormSection
                                    title="Voting behavior"
                                    description="These settings affect how results and vote changes work."
                                >
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
                                </FormSection>
                            </>
                        }
                    />

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
