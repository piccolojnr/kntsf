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
import { store, update } from '@/routes/academic-periods';
import type { AcademicPeriod } from '../types';

type AcademicPeriodFormDialogProps = {
    mode: 'create' | 'edit';
    period?: AcademicPeriod;
    trigger: ReactNode;
};

export function AcademicPeriodFormDialog({
    mode,
    period,
    trigger,
}: AcademicPeriodFormDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditing = mode === 'edit' && period !== undefined;
    const form = isEditing ? update.form(period.id) : store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="app-panel sm:max-w-lg">
                <p className="app-kicker">Calendar window</p>
                <DialogTitle>
                    {isEditing
                        ? 'Edit academic period'
                        : 'Create academic period'}
                </DialogTitle>
                <DialogDescription>
                    Periods define the semester window permits will later use.
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
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
                                    <Label
                                        htmlFor={`period_name_${period?.id ?? 'new'}`}
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id={`period_name_${period?.id ?? 'new'}`}
                                        name="name"
                                        required
                                        maxLength={255}
                                        defaultValue={period?.name ?? ''}
                                        placeholder="2025/2026 First Semester"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`academic_year_${period?.id ?? 'new'}`}
                                    >
                                        Academic year
                                    </Label>
                                    <Input
                                        id={`academic_year_${period?.id ?? 'new'}`}
                                        name="academic_year"
                                        required
                                        maxLength={50}
                                        defaultValue={
                                            period?.academic_year ?? ''
                                        }
                                        placeholder="2025/2026"
                                    />
                                    <InputError
                                        message={errors.academic_year}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`semester_${period?.id ?? 'new'}`}
                                    >
                                        Semester
                                    </Label>
                                    <Input
                                        id={`semester_${period?.id ?? 'new'}`}
                                        name="semester"
                                        maxLength={100}
                                        defaultValue={period?.semester ?? ''}
                                        placeholder="First Semester"
                                    />
                                    <InputError message={errors.semester} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`starts_at_${period?.id ?? 'new'}`}
                                    >
                                        Starts at
                                    </Label>
                                    <Input
                                        id={`starts_at_${period?.id ?? 'new'}`}
                                        name="starts_at"
                                        type="date"
                                        defaultValue={period?.starts_at ?? ''}
                                    />
                                    <InputError message={errors.starts_at} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`ends_at_${period?.id ?? 'new'}`}
                                    >
                                        Ends at
                                    </Label>
                                    <Input
                                        id={`ends_at_${period?.id ?? 'new'}`}
                                        name="ends_at"
                                        type="date"
                                        defaultValue={period?.ends_at ?? ''}
                                    />
                                    <InputError message={errors.ends_at} />
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
                                <Button
                                    disabled={processing}
                                    className="theme-primary-action"
                                >
                                    {isEditing
                                        ? 'Save changes'
                                        : 'Create period'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
