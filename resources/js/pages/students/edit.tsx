import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, show, update } from '@/routes/students';

type Student = {
    id: number;
    student_number: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    course: string | null;
    level: string | null;
};

export default function EditStudent({ student }: { student: Student }) {
    return (
        <>
            <Head title={`Edit ${student.student_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <Heading
                    title="Edit student"
                    description="Update the base student record."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>{student.student_number}</CardTitle>
                        <CardDescription>
                            Changes here do not activate student accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...update.form(student.id)}
                            options={{ preserveScroll: true }}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <StudentFields
                                        student={student}
                                        errors={errors}
                                    />

                                    <div className="flex items-center gap-3">
                                        <Button disabled={processing}>
                                            Save changes
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href={show(student.id)}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function StudentFields({
    student,
    errors,
}: {
    student: Student;
    errors: Record<string, string | undefined>;
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="student_number">Student number</Label>
                <Input
                    id="student_number"
                    name="student_number"
                    required
                    maxLength={50}
                    defaultValue={student.student_number}
                />
                <InputError message={errors.student_number} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    maxLength={255}
                    defaultValue={student.name ?? ''}
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    maxLength={255}
                    defaultValue={student.email ?? ''}
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    name="phone"
                    maxLength={50}
                    defaultValue={student.phone ?? ''}
                />
                <InputError message={errors.phone} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                        id="course"
                        name="course"
                        maxLength={255}
                        defaultValue={student.course ?? ''}
                    />
                    <InputError message={errors.course} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="level">Level</Label>
                    <Input
                        id="level"
                        name="level"
                        maxLength={100}
                        defaultValue={student.level ?? ''}
                    />
                    <InputError message={errors.level} />
                </div>
            </div>
        </>
    );
}

EditStudent.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: index(),
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
