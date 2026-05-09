import { Head } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { StudentDeleteDialog } from '@/features/students/components/student-delete-dialog';
import { StudentFormDialog } from '@/features/students/components/student-form-dialog';
import type { Student } from '@/features/students/types';
import { index } from '@/routes/students';

export default function ShowStudent({
    student,
    can,
}: {
    student: Student;
    can: { update: boolean; delete: boolean };
}) {
    return (
        <>
            <Head title={student.student_number} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={student.student_number}
                        description={
                            student.name ?? 'Base student record details'
                        }
                    />

                    <div className="flex gap-2">
                        {can.update && (
                            <StudentFormDialog
                                mode="edit"
                                student={student}
                                trigger={
                                    <Button variant="outline">
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
                                    <Button variant="destructive">
                                        <Trash2 />
                                        Delete
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Student information</CardTitle>
                        <CardDescription>
                            Account, permit, NFC, and payment workflows are not
                            attached yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <Detail
                                label="Student number"
                                value={student.student_number}
                            />
                            <Detail label="Name" value={student.name} />
                            <Detail label="Email" value={student.email} />
                            <Detail label="Phone" value={student.phone} />
                            <Detail label="Course" value={student.course} />
                            <Detail label="Level" value={student.level} />
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Detail({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="rounded-md border p-4">
            <dt className="text-sm font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-sm">{value ?? 'Not provided'}</dd>
        </div>
    );
}

ShowStudent.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: index(),
        },
        {
            title: 'Details',
            href: '#',
        },
    ],
};
