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
                    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-5">
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

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={announcement?.slug}
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
                                    defaultValue={announcement?.excerpt ?? ''}
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
                                    defaultValue={announcement?.content ?? ''}
                                    rows={12}
                                    required
                                />
                                <InputError message={errors.content} />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <PublishStatusSelect
                                            defaultValue={
                                                announcement?.status ??
                                                defaults.status
                                            }
                                        />
                                        <InputError message={errors.status} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Visibility</Label>
                                        <Select
                                            name="visibility"
                                            defaultValue={
                                                announcement?.visibility ??
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
                                        <Label htmlFor="published_at">
                                            Published at
                                        </Label>
                                        <Input
                                            id="published_at"
                                            name="published_at"
                                            type="datetime-local"
                                            defaultValue={toDatetimeLocal(
                                                announcement?.published_at,
                                            )}
                                        />
                                        <InputError
                                            message={errors.published_at}
                                        />
                                    </div>

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
                                                announcement?.is_featured ??
                                                defaults.is_featured
                                            }
                                        />
                                        <Label htmlFor="is_featured">
                                            Featured announcement
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="featured_image">
                                            Featured image
                                        </Label>
                                        <Input
                                            id="featured_image"
                                            name="featured_image"
                                            type="file"
                                            accept="image/*"
                                        />
                                        <InputError
                                            message={errors.featured_image}
                                        />
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
                            {isEditing ? 'Save changes' : 'Create announcement'}
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
