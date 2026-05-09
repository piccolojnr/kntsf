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
import { index, store } from '@/routes/students';

export default function CreateStudent() {
    return (
        <>
            <Head title="Create student" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <Heading
                    title="Create student"
                    description="Add the base student details. Account activation comes later."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Student details</CardTitle>
                        <CardDescription>
                            Student number is required and must be unique.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...store.form()} className="space-y-5">
                            {({ processing, errors }) => (
                                <>
                                    <StudentFields errors={errors} />

                                    <div className="flex items-center gap-3">
                                        <Button disabled={processing}>
                                            Create student
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href={index()}>Cancel</Link>
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
    errors,
}: {
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
                />
                <InputError message={errors.student_number} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" maxLength={255} />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" maxLength={255} />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" maxLength={50} />
                <InputError message={errors.phone} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="course">Course</Label>
                    <Input id="course" name="course" maxLength={255} />
                    <InputError message={errors.course} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="level">Level</Label>
                    <Input id="level" name="level" maxLength={100} />
                    <InputError message={errors.level} />
                </div>
            </div>
        </>
    );
}

CreateStudent.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: index(),
        },
        {
            title: 'Create',
            href: '#',
        },
    ],
};
