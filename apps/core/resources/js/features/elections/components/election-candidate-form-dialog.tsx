import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
import { StudentSearchSelector } from '@/components/shared/student-search-selector';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/features/content/components/image-upload-field';
import { MultipleFileUploadField } from '@/features/content/components/multiple-file-upload-field';
import { RichTextEditor } from '@/features/content/components/rich-text-editor';
import { update as updateCandidate } from '@/routes/candidates';
import { store as storeCandidate } from '@/routes/elections/candidates';
import type {
    Election,
    ElectionCandidate,
    ElectionFormOptions,
    ElectionPosition,
} from '../types';

export function ElectionCandidateFormDialog({
    election,
    position,
    candidate,
    options,
    trigger,
}: {
    election: Election;
    position: ElectionPosition;
    candidate?: ElectionCandidate;
    options: ElectionFormOptions;
    trigger: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [closeAfterSave, setCloseAfterSave] = useState(true);
    const isEditing = candidate !== undefined;
    const form = isEditing
        ? updateCandidate.form(candidate.id)
        : storeCandidate.form({ election: election.id, position: position.id });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-6xl">
                <DialogTitle>
                    {isEditing ? 'Edit candidate' : `Add candidate for ${position.title}`}
                </DialogTitle>
                <DialogDescription>
                    Link a student to this position, then add campaign details and
                    a candidate image.
                </DialogDescription>

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    resetOnSuccess={!isEditing}
                    onSuccess={() => {
                        if (closeAfterSave) {
                            setOpen(false);
                        }
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                                <div className="space-y-4">
                                    <StudentSearchSelector
                                        students={options.students}
                                        errors={errors}
                                        defaultStudentId={candidate?.student_id}
                                    />

                                    <div className="grid gap-2">
                                        <Label htmlFor={`candidate_slogan_${candidate?.id ?? 'new'}`}>
                                            Slogan
                                        </Label>
                                        <Input
                                            id={`candidate_slogan_${candidate?.id ?? 'new'}`}
                                            name="slogan"
                                            defaultValue={candidate?.slogan ?? ''}
                                            maxLength={255}
                                            placeholder="Short campaign message"
                                        />
                                        <InputError message={errors.slogan} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`candidate_manifesto_${candidate?.id ?? 'new'}`}>
                                            Manifesto
                                        </Label>
                                        <RichTextEditor
                                            id={`candidate_manifesto_${candidate?.id ?? 'new'}`}
                                            name="manifesto"
                                            label="Candidate manifesto"
                                            defaultValue={
                                                candidate?.manifesto ?? ''
                                            }
                                            rows={10}
                                            placeholder="Summarize what the candidate is promising."
                                        />
                                        <InputError message={errors.manifesto} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <ImageUploadField
                                        id={`candidate_poster_${candidate?.id ?? 'new'}`}
                                        name="poster"
                                        label="Candidate image"
                                        existingUrl={candidate?.poster_url}
                                        description="Use a clear profile image or campaign poster."
                                        error={errors.poster}
                                    />

                                    <MultipleFileUploadField
                                        id={`candidate_gallery_${candidate?.id ?? 'new'}`}
                                        name="gallery[]"
                                        label="Campaign gallery"
                                        accept="image/*"
                                        variant="images"
                                        description="Optional supporting campaign images."
                                        error={errors.gallery}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => resetAndClearErrors()}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                {!isEditing && (
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                        onClick={() => setCloseAfterSave(false)}
                                    >
                                        Save and add another
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    onClick={() => setCloseAfterSave(true)}
                                >
                                    {isEditing ? 'Save changes' : 'Save candidate'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
