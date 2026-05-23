import { Head, router } from '@inertiajs/react';
import {
    GraduationCap,
    Plus,
    Search,
    ShieldCheck,
    UserRoundPlus

} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import Heading from '@/components/shared/heading';
import { Badge } from '@/components/ui/badge';
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
    StudentFormOptions,
    StudentIndexPermissions,
} from '@/features/students/types';
import { index } from '@/routes/students';

export default function StudentsIndex({
    students,
    filters,
    options,
    can,
}: {
    students: Paginated<Student>;
    filters: { search: string };
    options: StudentFormOptions;
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Students"
                        description="Manage student profiles, account readiness, and academic details."
                    />

                    {can.create && (
                        <StudentFormDialog
                            mode="create"
                            options={options}
                            trigger={
                                <Button
                                    className="h-[39.5px] w-[39.5px] bg-app-ink px-0 text-app-surface hover:bg-app-red sm:w-auto sm:px-3"
                                >
                                    <Plus />
                                    New student
                                </Button>
                            }
                        />
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <OverviewTile
                        icon={GraduationCap}
                        label="Visible records"
                        value={students.total.toString()}
                    />
                    <OverviewTile
                        icon={ShieldCheck}
                        label="Account workflow"
                        value="Activation ready"
                    />
                    <OverviewTile
                        icon={UserRoundPlus}
                        label="Student number prefix"
                        value={options.student_number_prefix}
                    />
                </div>

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Student directory</CardTitle>
                                <CardDescription>
                                    Search by student number, name, email, or
                                    course.
                                </CardDescription>
                            </div>
                            <Badge variant="outline">
                                {options.courses.length} courses configured
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t py-4">
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

                        <StudentList
                            students={students}
                            can={can}
                            options={options}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function OverviewTile({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-md border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium">{value}</p>
            </div>
        </div>
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
