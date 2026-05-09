import { Head, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StudentFormDialog } from '@/features/students/components/student-form-dialog';
import { StudentList } from '@/features/students/components/student-list';
import type {
    Paginated,
    Student,
    StudentIndexPermissions,
} from '@/features/students/types';
import { index } from '@/routes/students';

export default function StudentsIndex({
    students,
    filters,
    can,
}: {
    students: Paginated<Student>;
    filters: { search: string };
    can: StudentIndexPermissions;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get(
            index.url(),
            { search: searchTerm || undefined },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    return (
        <>
            <Head title="Students" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Students"
                        description="Manage the base student records used by future operational modules."
                    />

                    {can.create && (
                        <StudentFormDialog
                            mode="create"
                            trigger={
                                <Button>
                                    <Plus />
                                    New student
                                </Button>
                            }
                        />
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student records</CardTitle>
                        <CardDescription>
                            Search by student number, name, email, or course.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            onSubmit={submitSearch}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    className="pl-9"
                                    placeholder="Search students"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>

                        <StudentList students={students} can={can} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StudentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: index(),
        },
    ],
};
