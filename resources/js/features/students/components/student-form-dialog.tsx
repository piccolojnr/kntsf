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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store, update } from '@/routes/students';
import type { Student, StudentFormOptions } from '../types';

type StudentFormDialogProps = {
    mode: 'create' | 'edit';
    options: StudentFormOptions;
    student?: Student;
    trigger: ReactNode;
};

export function StudentFormDialog({
    mode,
    options,
    student,
    trigger,
}: StudentFormDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditing = mode === 'edit' && student !== undefined;
    const form = isEditing ? update.form(student.id) : store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <div className="space-y-1">
                    <DialogTitle>
                        {isEditing ? 'Edit student' : 'Create student'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the academic profile and contact details.'
                            : 'Create the student profile before account activation.'}
                    </DialogDescription>
                </div>

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
                                mode={mode}
                                options={options}
                                student={student}
                                errors={errors}
                            />

                            <DialogFooter className="border-t pt-4">
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
    mode,
    options,
    student,
    errors,
}: {
    mode: 'create' | 'edit';
    options: StudentFormOptions;
    student?: Student;
    errors: Record<string, string | undefined>;
}) {
    const fieldId = student?.id ?? 'new';

    return (
        <div className="space-y-5">
            <div className="rounded-md border bg-muted/10 p-4">
                <div className="mb-4">
                    <p className="text-sm font-medium">Identity</p>
                    <p className="text-xs text-muted-foreground">
                        Core student number and display name.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
                    <div className="grid gap-2">
                        <Label htmlFor={`student_number_${fieldId}`}>
                            Student number
                        </Label>
                        <Input
                            id={`student_number_${fieldId}`}
                            name="student_number"
                            required
                            maxLength={50}
                            defaultValue={
                                student?.student_number ??
                                (mode === 'create'
                                    ? options.student_number_prefix
                                    : '')
                            }
                            placeholder={`${options.student_number_prefix}2859`}
                            className="font-mono"
                        />
                        <InputError message={errors.student_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`student_name_${fieldId}`}>Name</Label>
                        <Input
                            id={`student_name_${fieldId}`}
                            name="name"
                            maxLength={255}
                            defaultValue={student?.name ?? ''}
                            placeholder="Student full name"
                        />
                        <InputError message={errors.name} />
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-muted/10 p-4">
                <div className="mb-4">
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-xs text-muted-foreground">
                        Email and phone details used for account activation.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor={`student_email_${fieldId}`}>Email</Label>
                        <Input
                            id={`student_email_${fieldId}`}
                            name="email"
                            type="email"
                            maxLength={255}
                            defaultValue={student?.email ?? ''}
                            placeholder="student@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`student_phone_${fieldId}`}>Phone</Label>
                        <Input
                            id={`student_phone_${fieldId}`}
                            name="phone"
                            maxLength={50}
                            defaultValue={student?.phone ?? ''}
                            placeholder="Phone number"
                        />
                        <InputError message={errors.phone} />
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-muted/10 p-4">
                <div className="mb-4">
                    <p className="text-sm font-medium">Academic profile</p>
                    <p className="text-xs text-muted-foreground">
                        Course and level placement for this student.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor={`student_course_${fieldId}`}>Course</Label>
                        <Select
                            name="course"
                            defaultValue={student?.course ?? undefined}
                        >
                            <SelectTrigger
                                id={`student_course_${fieldId}`}
                                className="h-9 w-full text-sm"
                            >
                                <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                                {options.courses.map((course) => (
                                    <SelectItem
                                        key={course.value}
                                        value={course.value}
                                    >
                                        {course.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.course} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`student_level_${fieldId}`}>Level</Label>
                        <Select
                            name="level"
                            defaultValue={student?.level ?? undefined}
                        >
                            <SelectTrigger
                                id={`student_level_${fieldId}`}
                                className="h-9 w-full text-sm"
                            >
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                {options.levels.map((level) => (
                                    <SelectItem
                                        key={level.value}
                                        value={level.value}
                                    >
                                        Level {level.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.level} />
                    </div>
                </div>
            </div>
        </div>
    );
}
