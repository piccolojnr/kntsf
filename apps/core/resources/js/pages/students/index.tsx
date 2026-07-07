import { Head, router } from '@inertiajs/react';
import {
    GraduationCap,
    Plus,
    Search,
    ShieldCheck,
    UserRoundPlus,
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

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel relative overflow-hidden p-5 md:p-6">
                    <div className="absolute right-6 bottom-6 size-24 rounded-full border border-dashed border-app-border opacity-70" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading
                            title="Students"
                            description="Manage student profiles, account readiness, and academic details."
                        />

                        {can.create && (
                            <StudentFormDialog
                                mode="create"
                                options={options}
                                trigger={
                                    <Button className="theme-primary-action h-[39.5px] w-[39.5px] px-0 sm:w-auto sm:px-3">
                                        <Plus />
                                        New student
                                    </Button>
                                }
                            />
                        )}
                    </div>
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

                <Card className="app-panel gap-0 overflow-hidden py-0">
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
                    <CardContent className="space-y-4 border-t border-app-border py-4">
                        <form
                            onSubmit={submitSearch}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    className="h-11 rounded-xl border-app-border bg-app-surface pl-9"
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
        <div className="app-panel-muted flex items-center gap-3 p-4 transition duration-300 hover:-translate-y-0.5">
            <div className="theme-primary-active flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                    {label}
                </p>
                <p className="truncate text-sm font-semibold text-app-ink">
                    {value}
                </p>
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
