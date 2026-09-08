import { Link } from '@inertiajs/react';
import { Eye, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/students';
import type {
    Paginated,
    Student,
    StudentFormOptions,
    StudentIndexPermissions,
} from '../types';
import { StudentActivateAccountDialog } from './student-activate-account-dialog';
import { StudentDeleteDialog } from './student-delete-dialog';
import { StudentFormDialog } from './student-form-dialog';

export function StudentList({
    students,
    can,
    options,
}: {
    students: Paginated<Student>;
    can: StudentIndexPermissions;
    options: StudentFormOptions;
}) {
    if (students.data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No student records found
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm text-app-muted">
                    Create the first student record or adjust your search.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-app-border bg-app-surface">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[920px] table-auto text-sm">
                        <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.1em] uppercase">
                                    Student
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.1em] uppercase">
                                    Contact
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.1em] uppercase">
                                    Course
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.1em] uppercase">
                                    Level
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.1em] uppercase">
                                    Account
                                </th>
                                <th className="px-4 py-3 text-right font-semibold tracking-[0.1em] uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {students.data.map((student) => (
                                <tr
                                    key={student.id}
                                    className="bg-app-surface transition duration-200 hover:bg-app-surface-muted"
                                >
                                    <td className="px-4 py-3 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="theme-ink-soft flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-app-red">
                                                {student.name
                                                    ?.slice(0, 2)
                                                    .toUpperCase() ?? 'ST'}
                                            </div>
                                            <div>
                                                <Link
                                                    href={show(student.id)}
                                                    className="font-semibold text-app-ink transition hover:text-app-red"
                                                >
                                                    {student.name ??
                                                        'Unnamed student'}
                                                </Link>
                                                <p className="text-xs text-app-muted">
                                                    {student.student_number}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <div>
                                            <p>{student.email ?? 'No email'}</p>
                                            <p className="text-xs text-app-muted">
                                                {student.phone ?? 'No phone'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        {student.course ?? 'No course'}
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        {student.level ? (
                                            <Badge variant="outline">
                                                Level {student.level}
                                            </Badge>
                                        ) : (
                                            <span className="text-app-muted">
                                                No level
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <AccountStatus student={student} />
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <Link href={show(student.id)}>
                                                    <Eye />
                                                    View
                                                </Link>
                                            </Button>

                                            {can.activateAccount &&
                                                student.account_status !==
                                                    'activated' && (
                                                    <StudentActivateAccountDialog
                                                        student={student}
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                            >
                                                                <KeyRound />
                                                                Activate
                                                            </Button>
                                                        }
                                                    />
                                                )}

                                            {can.update && (
                                                <StudentFormDialog
                                                    mode="edit"
                                                    options={options}
                                                    student={student}
                                                    trigger={
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Pencil />
                                                            Edit
                                                        </Button>
                                                    }
                                                />
                                            )}

                                            {can.delete && (
                                                <StudentDeleteDialog
                                                    student={student}
                                                    trigger={
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                        >
                                                            <Trash2 />
                                                            Delete
                                                        </Button>
                                                    }
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination students={students} />
        </div>
    );
}

export function AccountStatus({ student }: { student: Student }) {
    const className = {
        activated:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
        pending_setup:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
        not_activated: 'border-border bg-muted/50 text-muted-foreground',
    }[student.account_status];

    return (
        <Badge
            variant="outline"
            className={`rounded-md px-2 py-1 ${className}`}
        >
            {student.account_status_label}
        </Badge>
    );
}

function Pagination({ students }: { students: Paginated<Student> }) {
    return (
        <div className="flex flex-col gap-3 text-sm text-app-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
                Showing {students.from ?? 0} to {students.to ?? 0} of{' '}
                {students.total} students · Page {students.current_page} of{' '}
                {students.last_page}
            </span>
            <div className="flex flex-wrap gap-2">
                {students.links.map((link) => (
                    <Button
                        key={`${link.label}-${link.url}`}
                        asChild={link.url !== null}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={link.url === null}
                    >
                        {link.url ? (
                            <Link
                                href={link.url}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : (
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}
