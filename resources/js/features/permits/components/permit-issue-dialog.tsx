import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
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
import { store } from '@/routes/permits';
import type { PermitOptions } from '../types';

export function PermitIssueDialog({
    options,
    trigger,
}: {
    options: PermitOptions;
    trigger?: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const activePeriod = options.academic_periods.find((period) => period.is_active);
    const selectedStudent = options.students.find(
        (student) => student.id.toString() === selectedStudentId,
    );
    const filteredStudents = useMemo(() => {
        const search = studentSearch.trim().toLowerCase();

        if (search === '') {
            return options.students.slice(0, 8);
        }

        return options.students
            .filter((student) =>
                [
                    student.student_number,
                    student.name ?? '',
                    student.email ?? '',
                    student.label,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(search),
            )
            .slice(0, 8);
    }, [options.students, studentSearch]);

    function selectStudent(student: PermitOptions['students'][number]) {
        setSelectedStudentId(student.id.toString());
        setStudentSearch(student.label);
        setStudentEmail(student.email ?? '');
    }

    function closeDialog(nextOpen: boolean) {
        setOpen(nextOpen);

        if (!nextOpen) {
            setSelectedStudentId('');
            setStudentSearch('');
            setStudentEmail('');
        }
    }

    return (
        <Dialog open={open} onOpenChange={closeDialog}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        <Plus />
                        Issue permit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle>Issue permit</DialogTitle>
                <DialogDescription>
                    A permit code will be generated once and will not be stored
                    in plaintext.
                </DialogDescription>

                <Form
                    {...store.form()}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            {errors.permit && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                    {errors.permit}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="student_id">Student</Label>
                                <input
                                    type="hidden"
                                    name="student_id"
                                    value={selectedStudentId}
                                />
                                <div className="rounded-md border bg-popover">
                                    <Input
                                        id="student_id"
                                        value={studentSearch}
                                        onChange={(event) => {
                                            setStudentSearch(event.target.value);
                                            setSelectedStudentId('');
                                            setStudentEmail('');
                                        }}
                                        placeholder="Search by student number, name, or email"
                                        autoComplete="off"
                                    />
                                    <div className="max-h-48 overflow-y-auto border-t p-1">
                                        {filteredStudents.length === 0 ? (
                                            <p className="px-2 py-2 text-xs text-muted-foreground">
                                                No matching students
                                            </p>
                                        ) : (
                                            filteredStudents.map((student) => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    className="w-full rounded-md px-2 py-2 text-left text-xs hover:bg-muted"
                                                    onClick={() =>
                                                        selectStudent(student)
                                                    }
                                                >
                                                    <span className="block font-medium">
                                                        {student.label}
                                                    </span>
                                                    <span className="block text-muted-foreground">
                                                        {student.email ??
                                                            'No email on record'}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                                {selectedStudent && (
                                    <p className="text-xs text-muted-foreground">
                                        Selected: {selectedStudent.label}
                                    </p>
                                )}
                                <InputError message={errors.student_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="student_email">
                                    Student email
                                </Label>
                                <Input
                                    id="student_email"
                                    name="student_email"
                                    type="email"
                                    value={studentEmail}
                                    onChange={(event) =>
                                        setStudentEmail(event.target.value)
                                    }
                                    placeholder="student@example.com"
                                />
                                <InputError message={errors.student_email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="academic_period_id">
                                    Academic period
                                </Label>
                                <Select
                                    name="academic_period_id"
                                    defaultValue={activePeriod?.id.toString()}
                                >
                                    <SelectTrigger id="academic_period_id" className="h-9 w-full text-sm">
                                        <SelectValue placeholder="Use active period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.academic_periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.label}
                                                {period.is_active ? ' (active)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.academic_period_id} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="starts_at">Starts at</Label>
                                    <Input
                                        id="starts_at"
                                        name="starts_at"
                                        type="datetime-local"
                                        defaultValue={
                                            options.issue_defaults.starts_at
                                        }
                                    />
                                    <InputError message={errors.starts_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expires_at">Expires at</Label>
                                    <Input
                                        id="expires_at"
                                        name="expires_at"
                                        type="datetime-local"
                                        defaultValue={
                                            options.issue_defaults.expires_at
                                        }
                                    />
                                    <InputError message={errors.expires_at} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="amount_paid">Amount paid</Label>
                                <Input
                                    id="amount_paid"
                                    name="amount_paid"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={
                                        options.issue_defaults.amount_paid
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Currency: {options.issue_defaults.currency}
                                </p>
                                <InputError message={errors.amount_paid} />
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
                                <Button disabled={processing}>Issue permit</Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
