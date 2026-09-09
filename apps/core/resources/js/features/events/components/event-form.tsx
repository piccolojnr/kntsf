import { Form } from '@inertiajs/react';
import { Save } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContentFormShell } from '@/features/content/components/content-form-shell';
import { FormSection } from '@/features/content/components/form-section';
import { ImageUploadField } from '@/features/content/components/image-upload-field';
import { MultipleFileUploadField } from '@/features/content/components/multiple-file-upload-field';
import {
    PublishingSettings,
    toDatetimeLocal,
} from '@/features/content/components/publishing-settings';
import { RichTextEditor } from '@/features/content/components/rich-text-editor';
import { SlugField } from '@/features/content/components/slug-field';
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
                    <ContentFormShell
                        main={
                            <FormSection
                                title="Event content"
                                description="Describe the event clearly enough for students to decide whether to attend."
                            >
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

                                <SlugField
                                    defaultValue={event?.slug}
                                    error={errors.slug}
                                />

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
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <RichTextEditor
                                        id="description"
                                        name="description"
                                        label="Event description"
                                        defaultValue={event?.description ?? ''}
                                        rows={14}
                                        required
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </FormSection>
                        }
                        sidebar={
                            <>
                                <FormSection
                                    title="Schedule"
                                    description="Set the event timing and publishing state."
                                >
                                    <PublishingSettings
                                        status={event?.status ?? defaults.status}
                                        visibility={
                                            event?.visibility ??
                                            defaults.visibility
                                        }
                                        publishedAt={event?.published_at}
                                        isFeatured={
                                            event?.is_featured ??
                                            defaults.is_featured
                                        }
                                        featuredLabel="Featured event"
                                        errors={errors}
                                    />

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
                                </FormSection>

                                <FormSection
                                    title="Event details"
                                    description="Operational details shown with the event."
                                >
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
                                </FormSection>

                                <FormSection
                                    title="Media"
                                    description="Use a banner first, then optional gallery images."
                                >
                                    <ImageUploadField
                                        id="banner"
                                        name="banner"
                                        label="Banner"
                                        existingUrl={event?.banner_url}
                                        error={errors.banner}
                                    />

                                    <MultipleFileUploadField
                                        id="gallery"
                                        name="gallery[]"
                                        label="Gallery"
                                        accept="image/*"
                                        variant="images"
                                        description="Select one or more event images."
                                        error={errors.gallery}
                                    />
                                </FormSection>
                            </>
                        }
                    />

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
