import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { create, edit, index, show } from '@/routes/students';

type Student = {
    id: number;
    student_number: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    course: string | null;
    level: string | null;
    created_at: string | null;
};

type Paginated<T> = {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from: number | null;
    to: number | null;
    total: number;
};

export default function StudentsIndex({
    students,
    filters,
    can,
}: {
    students: Paginated<Student>;
    filters: { search: string };
    can: { create: boolean };
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
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New student
                            </Link>
                        </Button>
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

                        {students.data.length > 0 ? (
                            <div className="overflow-hidden rounded-md border">
                                <div className="min-w-[760px]">
                                    <div className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_0.8fr_1.1fr] border-b bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                        <span>Student no.</span>
                                        <span>Name</span>
                                        <span>Email</span>
                                        <span>Course</span>
                                        <span>Level</span>
                                        <span className="text-right">
                                            Actions
                                        </span>
                                    </div>
                                    {students.data.map((student) => (
                                        <div
                                            key={student.id}
                                            className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_0.8fr_1.1fr] items-center border-b px-4 py-3 text-sm last:border-b-0"
                                        >
                                            <span className="font-medium">
                                                {student.student_number}
                                            </span>
                                            <span>
                                                {student.name ?? 'Unassigned'}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {student.email ?? 'No email'}
                                            </span>
                                            <span>
                                                {student.course ?? 'No course'}
                                            </span>
                                            <span>
                                                {student.level ?? 'No level'}
                                            </span>
                                            <span className="flex justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    <Link href={show(student.id)}>
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link href={edit(student.id)}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-md border border-dashed p-8 text-center">
                                <p className="text-sm font-medium">
                                    No students found
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create the first student record or adjust
                                    your search.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <span>
                                Showing {students.from ?? 0} to{' '}
                                {students.to ?? 0} of {students.total}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {students.links.map((link) => (
                                    <Button
                                        key={`${link.label}-${link.url}`}
                                        asChild={link.url !== null}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
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
