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
} from '@/features/content/components/publishing-settings';
import { RichTextEditor } from '@/features/content/components/rich-text-editor';
import { SlugField } from '@/features/content/components/slug-field';
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
                    <ContentFormShell
                        main={
                            <FormSection
                                title="Document content"
                                description="Describe the file so dashboard users know what they are downloading."
                            >
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

                                <SlugField
                                    defaultValue={document?.slug}
                                    error={errors.slug}
                                />

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
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <RichTextEditor
                                        id="description"
                                        name="description"
                                        label="Document description"
                                        defaultValue={
                                            document?.description ?? ''
                                        }
                                        rows={12}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </FormSection>
                        }
                        sidebar={
                            <>
                                <FormSection
                                    title="Publishing"
                                    description="Documents need at least one file before publishing."
                                >
                                    <PublishingSettings
                                        status={
                                            document?.status ?? defaults.status
                                        }
                                        visibility={
                                            document?.visibility ??
                                            defaults.visibility
                                        }
                                        publishedAt={document?.published_at}
                                        isFeatured={
                                            document?.is_featured ??
                                            defaults.is_featured
                                        }
                                        featuredLabel="Featured document"
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
                                                document?.category ?? ''
                                            }
                                            maxLength={100}
                                            placeholder="Minutes, Forms, Guidelines"
                                        />
                                        <InputError message={errors.category} />
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Files"
                                    description="Upload dashboard-accessible document files and an optional image."
                                >
                                    <MultipleFileUploadField
                                        id="files"
                                        name="files[]"
                                        label="Document files"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        description="PDF, Word, Excel, and PowerPoint files up to 10 MB each."
                                        error={errors.files}
                                    />

                                    <ImageUploadField
                                        id="featured_image"
                                        name="featured_image"
                                        label="Featured image"
                                        existingUrl={
                                            document?.featured_image_url
                                        }
                                        error={errors.featured_image}
                                    />
                                </FormSection>

                                {isEditing && (
                                    <FormSection title="Attached files">
                                        <DocumentFileList
                                            files={document.files}
                                        />
                                    </FormSection>
                                )}
                            </>
                        }
                    />

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
