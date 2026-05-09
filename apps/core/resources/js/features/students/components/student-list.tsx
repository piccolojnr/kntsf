import { Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/students';
import type { Paginated, Student, StudentIndexPermissions } from '../types';
import { StudentDeleteDialog } from './student-delete-dialog';
import { StudentFormDialog } from './student-form-dialog';

export function StudentList({
    students,
    can,
}: {
    students: Paginated<Student>;
    can: StudentIndexPermissions;
}) {
    if (students.data.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm font-medium">No students found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create the first student record or adjust your search.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-md border">
                <div className="min-w-[760px]">
                    <div className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_0.8fr_1.2fr] border-b bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                        <span>Student no.</span>
                        <span>Name</span>
                        <span>Email</span>
                        <span>Course</span>
                        <span>Level</span>
                        <span className="text-right">Actions</span>
                    </div>
                    {students.data.map((student) => (
                        <div
                            key={student.id}
                            className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_0.8fr_1.2fr] items-center border-b px-4 py-3 text-sm last:border-b-0"
                        >
                            <span className="font-medium">
                                {student.student_number}
                            </span>
                            <span>{student.name ?? 'Unassigned'}</span>
                            <span className="text-muted-foreground">
                                {student.email ?? 'No email'}
                            </span>
                            <span>{student.course ?? 'No course'}</span>
                            <span>{student.level ?? 'No level'}</span>
                            <span className="flex justify-end gap-2">
                                <Button asChild size="sm" variant="ghost">
                                    <Link href={show(student.id)}>View</Link>
                                </Button>

                                {can.update && (
                                    <StudentFormDialog
                                        mode="edit"
                                        student={student}
                                        trigger={
                                            <Button size="sm" variant="outline">
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
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Pagination students={students} />
        </div>
    );
}

function Pagination({ students }: { students: Paginated<Student> }) {
    return (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
                Showing {students.from ?? 0} to {students.to ?? 0} of{' '}
                {students.total}
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
