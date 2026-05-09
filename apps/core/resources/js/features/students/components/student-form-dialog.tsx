import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
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
import { store, update } from '@/routes/students';
import type { Student } from '../types';

type StudentFormDialogProps = {
    mode: 'create' | 'edit';
    student?: Student;
    trigger: ReactNode;
};

export function StudentFormDialog({
    mode,
    student,
    trigger,
}: StudentFormDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditing = mode === 'edit' && student !== undefined;
    const form = isEditing ? update.form(student.id) : store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {isEditing ? 'Edit student' : 'Create student'}
                </DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? 'Update the base student record.'
                        : 'Add the base student details. Account activation comes later.'}
                </DialogDescription>

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    resetOnSuccess={!isEditing}
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <StudentFields
                                student={student}
                                errors={errors}
                            />

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
                                <Button disabled={processing}>
                                    {isEditing ? 'Save changes' : 'Create student'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function StudentFields({
    student,
    errors,
}: {
    student?: Student;
    errors: Record<string, string | undefined>;
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor={`student_number_${student?.id ?? 'new'}`}>
                    Student number
                </Label>
                <Input
                    id={`student_number_${student?.id ?? 'new'}`}
                    name="student_number"
                    required
                    maxLength={50}
                    defaultValue={student?.student_number ?? ''}
                />
                <InputError message={errors.student_number} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`student_name_${student?.id ?? 'new'}`}>
                    Name
                </Label>
                <Input
                    id={`student_name_${student?.id ?? 'new'}`}
                    name="name"
                    maxLength={255}
                    defaultValue={student?.name ?? ''}
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`student_email_${student?.id ?? 'new'}`}>
                    Email
                </Label>
                <Input
                    id={`student_email_${student?.id ?? 'new'}`}
                    name="email"
                    type="email"
                    maxLength={255}
                    defaultValue={student?.email ?? ''}
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`student_phone_${student?.id ?? 'new'}`}>
                    Phone
                </Label>
                <Input
                    id={`student_phone_${student?.id ?? 'new'}`}
                    name="phone"
                    maxLength={50}
                    defaultValue={student?.phone ?? ''}
                />
                <InputError message={errors.phone} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`student_course_${student?.id ?? 'new'}`}>
                        Course
                    </Label>
                    <Input
                        id={`student_course_${student?.id ?? 'new'}`}
                        name="course"
                        maxLength={255}
                        defaultValue={student?.course ?? ''}
                    />
                    <InputError message={errors.course} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`student_level_${student?.id ?? 'new'}`}>
                        Level
                    </Label>
                    <Input
                        id={`student_level_${student?.id ?? 'new'}`}
                        name="level"
                        maxLength={100}
                        defaultValue={student?.level ?? ''}
                    />
                    <InputError message={errors.level} />
                </div>
            </div>
        </>
    );
}
