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
import { store, update } from '@/routes/documents';
import type { Document, DocumentDefaults } from '../types';
import { DocumentFileList } from './document-file-list';

type DocumentFormProps = {
    document?: Document;
    defaults: DocumentDefaults;
};

export function DocumentForm({ document, defaults }: DocumentFormProps) {
    const isEditing = document !== undefined;

    return (
        <Form
            {...(isEditing ? update.form(document.id) : store.form())}
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
                                    defaultValue={document?.title}
                                    required
                                    maxLength={255}
                                    placeholder="Document title"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={document?.slug}
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
                                    defaultValue={document?.excerpt ?? ''}
                                    rows={3}
                                    placeholder="Short summary for document lists"
                                />
                                <InputError message={errors.excerpt} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <RichTextEditor
                                    id="description"
                                    name="description"
                                    defaultValue={document?.description ?? ''}
                                    rows={10}
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
                                                document?.status ??
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
                                                document?.visibility ??
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
                                                document?.published_at,
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
                                                document?.category ?? ''
                                            }
                                            maxLength={100}
                                            placeholder="Minutes, Forms, Guidelines"
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
                                                document?.is_featured ??
                                                defaults.is_featured
                                            }
                                        />
                                        <Label htmlFor="is_featured">
                                            Featured document
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-card p-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="files">
                                            Document files
                                        </Label>
                                        <Input
                                            id="files"
                                            name="files[]"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            multiple
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            PDF, Word, Excel, and PowerPoint
                                            files up to 10 MB each.
                                        </p>
                                        <InputError message={errors.files} />
                                    </div>

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
                                </div>
                            </div>

                            {isEditing && (
                                <div className="space-y-2">
                                    <Label>Attached files</Label>
                                    <DocumentFileList files={document.files} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            <Save />
                            {isEditing ? 'Save changes' : 'Create document'}
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
