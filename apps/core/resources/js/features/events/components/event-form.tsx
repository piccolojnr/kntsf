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
import { RichTextEditor } from '@/features/content/components/rich-text-editor';
import { store, update } from '@/routes/events';
import type { Event, EventDefaults } from '../types';

type EventFormProps = {
    event?: Event;
    defaults: EventDefaults;
};

export function EventForm({ event, defaults }: EventFormProps) {
    const isEditing = event !== undefined;

    return (
        <Form
            {...(isEditing ? update.form(event.id) : store.form())}
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
                                    defaultValue={event?.title}
                                    required
                                    maxLength={255}
                                    placeholder="Event title"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={event?.slug}
                                    maxLength={255}
                                    placeholder="Leave blank to generate from title"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    name="excerpt"
                                    defaultValue={event?.excerpt ?? ''}
                                    rows={3}
                                    placeholder="Short summary for listings"
                                />
                                <InputError message={errors.excerpt} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <RichTextEditor
                                    id="description"
                                    name="description"
                                    defaultValue={event?.description ?? ''}
                                    rows={12}
                                    required
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <PublishStatusSelect
                                            defaultValue={
                                                event?.status ?? defaults.status
                                            }
                                        />
                                        <InputError message={errors.status} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Visibility</Label>
                                        <Select
                                            name="visibility"
                                            defaultValue={
                                                event?.visibility ??
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
                                                event?.starts_at,
                                            )}
                                            required
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
                                                event?.ends_at,
                                            )}
                                        />
                                        <InputError message={errors.ends_at} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="published_at">
                                            Published at
                                        </Label>
                                        <Input
                                            id="published_at"
                                            name="published_at"
                                            type="datetime-local"
                                            defaultValue={toDatetimeLocal(
                                                event?.published_at,
                                            )}
                                        />
                                        <InputError
                                            message={errors.published_at}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="max_attendees">
                                            Max attendees
                                        </Label>
                                        <Input
                                            id="max_attendees"
                                            name="max_attendees"
                                            type="number"
                                            min={1}
                                            defaultValue={
                                                event?.max_attendees ?? ''
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError
                                            message={errors.max_attendees}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">
                                            Location
                                        </Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            defaultValue={event?.location ?? ''}
                                            maxLength={255}
                                            placeholder="Auditorium, Main campus"
                                        />
                                        <InputError message={errors.location} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            defaultValue={event?.category ?? ''}
                                            maxLength={100}
                                            placeholder="SRC, Sports, Academic"
                                        />
                                        <InputError message={errors.category} />
                                    </div>

                                    <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-3">
                                        <input
                                            type="hidden"
                                            name="is_featured"
                                            value="0"
                                        />
                                        <Checkbox
                                            id="is_featured"
                                            name="is_featured"
                                            value="1"
                                            defaultChecked={
                                                event?.is_featured ??
                                                defaults.is_featured
                                            }
                                        />
                                        <Label htmlFor="is_featured">
                                            Featured event
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner">Banner</Label>
                                        <Input
                                            id="banner"
                                            name="banner"
                                            type="file"
                                            accept="image/*"
                                        />
                                        <InputError message={errors.banner} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="gallery">Gallery</Label>
                                        <Input
                                            id="gallery"
                                            name="gallery[]"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                        />
                                        <InputError message={errors.gallery} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            <Save />
                            {isEditing ? 'Save changes' : 'Create event'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

function toDatetimeLocal(value?: string | null) {
    if (!value) {
        return '';
    }

    return new Date(value).toISOString().slice(0, 16);
}
