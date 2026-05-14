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
import { PublishingSettings } from '@/features/content/components/publishing-settings';
import { RichTextEditor } from '@/features/content/components/rich-text-editor';
import { SlugField } from '@/features/content/components/slug-field';
import { store, update } from '@/routes/announcements';
import type { Announcement, AnnouncementDefaults } from '../types';

type AnnouncementFormProps = {
    announcement?: Announcement;
    defaults: AnnouncementDefaults;
};

export function AnnouncementForm({
    announcement,
    defaults,
}: AnnouncementFormProps) {
    const isEditing = announcement !== undefined;

    return (
        <Form
            {...(isEditing ? update.form(announcement.id) : store.form())}
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <ContentFormShell
                        main={
                            <>
                                <FormSection
                                    title="Announcement content"
                                    description="Write the announcement students and executives will read."
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            defaultValue={announcement?.title}
                                            required
                                            maxLength={255}
                                            placeholder="Announcement title"
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <SlugField
                                        defaultValue={announcement?.slug}
                                        error={errors.slug}
                                    />

                                    <div className="grid gap-2">
                                        <Label htmlFor="excerpt">Excerpt</Label>
                                        <Textarea
                                            id="excerpt"
                                            name="excerpt"
                                            defaultValue={
                                                announcement?.excerpt ?? ''
                                            }
                                            rows={3}
                                            placeholder="Short summary for listings"
                                        />
                                        <InputError message={errors.excerpt} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="content">Content</Label>
                                        <RichTextEditor
                                            id="content"
                                            name="content"
                                            label="Announcement body"
                                            defaultValue={
                                                announcement?.content ?? ''
                                            }
                                            rows={14}
                                            required
                                        />
                                        <InputError message={errors.content} />
                                    </div>
                                </FormSection>
                            </>
                        }
                        sidebar={
                            <>
                                <FormSection
                                    title="Publishing"
                                    description="Control when and where this announcement appears."
                                >
                                    <PublishingSettings
                                        status={
                                            announcement?.status ??
                                            defaults.status
                                        }
                                        visibility={
                                            announcement?.visibility ??
                                            defaults.visibility
                                        }
                                        publishedAt={
                                            announcement?.published_at
                                        }
                                        isFeatured={
                                            announcement?.is_featured ??
                                            defaults.is_featured
                                        }
                                        featuredLabel="Featured announcement"
                                        errors={errors}
                                    />

                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            defaultValue={
                                                announcement?.category ?? ''
                                            }
                                            maxLength={100}
                                            placeholder="SRC, Campus, Academic"
                                        />
                                        <InputError message={errors.category} />
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Media"
                                    description="Add visuals that make the announcement easier to identify."
                                >
                                    <ImageUploadField
                                        id="featured_image"
                                        name="featured_image"
                                        label="Featured image"
                                        existingUrl={
                                            announcement?.featured_image_url
                                        }
                                        error={errors.featured_image}
                                    />

                                    <MultipleFileUploadField
                                        id="gallery"
                                        name="gallery[]"
                                        label="Gallery"
                                        accept="image/*"
                                        variant="images"
                                        description="Select one or more supporting images."
                                        error={errors.gallery}
                                    />
                                </FormSection>
                            </>
                        }
                    />

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            <Save />
                            {isEditing ? 'Save changes' : 'Create announcement'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
