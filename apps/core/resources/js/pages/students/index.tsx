import { Head, Link, router } from '@inertiajs/react';
import {
    FileUp,
    GraduationCap,
    Plus,
    RotateCcw,
    Search,
    ShieldCheck,
    UserRoundPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { ExportMenu } from '@/components/shared/export-menu';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StudentFormDialog } from '@/features/students/components/student-form-dialog';
import { StudentList } from '@/features/students/components/student-list';
import type {
    Paginated,
    Student,
    StudentFormOptions,
    StudentIndexPermissions,
} from '@/features/students/types';
import { index } from '@/routes/students';
import { show as importShow } from '@/routes/students/import';

export default function StudentsIndex({
    students,
    filters,
    options,
    can,
}: {
    students: Paginated<Student>;
    filters: {
        search: string;
        course: string;
        level: string;
        per_page: number;
    };
    options: StudentFormOptions;
    can: StudentIndexPermissions;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    function applyFilters(overrides: Partial<typeof filters>) {
        const nextFilters = { ...filters, ...overrides };

        router.get(
            index.url(),
            {
                search: nextFilters.search || undefined,
                course: nextFilters.course || undefined,
                level: nextFilters.level || undefined,
                per_page:
                    nextFilters.per_page === 10
                        ? undefined
                        : nextFilters.per_page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        applyFilters({ search: searchTerm });
    }

    return (
        <>
            <Head title="Students" />

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel p-5 md:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <Heading
                            title="Students"
                            description="Manage student profiles, account readiness, and academic details."
                        />

                        <div className="flex flex-wrap gap-2">
                            {can.import && (
                                <Button variant="outline" asChild>
                                    <Link href={importShow()}>
                                        <FileUp />
                                        Import
                                    </Link>
                                </Button>
                            )}
                            {can.create && (
                                <StudentFormDialog
                                    mode="create"
                                    options={options}
                                    trigger={
                                        <Button className="theme-primary-action">
                                            <Plus />
                                            New student
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-px overflow-hidden rounded-lg border border-app-border bg-app-border md:grid-cols-3">
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
                            <Badge className="rounded-md" variant="outline">
                                {options.courses.length} courses configured
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t border-app-border py-4">
                        <form onSubmit={submitSearch} className="grid gap-3">
                            <div className="flex flex-col gap-2 lg:flex-row">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        className="rounded-md border-app-border bg-app-surface pl-9"
                                        placeholder="Search students"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                                <ExportMenu
                                    resource="students"
                                    filters={{
                                        search: filters.search,
                                        course: filters.course,
                                        level: filters.level,
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                <Select
                                    value={filters.course || 'all'}
                                    onValueChange={(value) =>
                                        applyFilters({
                                            course:
                                                value === 'all' ? '' : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-56">
                                        <SelectValue placeholder="All courses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All courses
                                        </SelectItem>
                                        {options.courses.map((course) => (
                                            <SelectItem
                                                key={course.value}
                                                value={course.value}
                                            >
                                                {course.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.level || 'all'}
                                    onValueChange={(value) =>
                                        applyFilters({
                                            level: value === 'all' ? '' : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-44">
                                        <SelectValue placeholder="All levels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All levels
                                        </SelectItem>
                                        {options.levels.map((level) => (
                                            <SelectItem
                                                key={level.value}
                                                value={level.value}
                                            >
                                                Level {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={String(filters.per_page)}
                                    onValueChange={(value) =>
                                        applyFilters({
                                            per_page: Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full sm:ml-auto sm:w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 25, 50].map((size) => (
                                            <SelectItem
                                                key={size}
                                                value={String(size)}
                                            >
                                                {size} per page
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(filters.search ||
                                    filters.course ||
                                    filters.level ||
                                    filters.per_page !== 10) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setSearchTerm('');
                                            applyFilters({
                                                search: '',
                                                course: '',
                                                level: '',
                                                per_page: 10,
                                            });
                                        }}
                                    >
                                        <RotateCcw />
                                        Clear filters
                                    </Button>
                                )}
                            </div>
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
        <div className="app-panel-muted flex items-center gap-3 rounded-none border-0 p-4 transition-colors duration-200 hover:bg-app-surface">
            <div className="theme-primary-active flex size-9 shrink-0 items-center justify-center rounded-md">
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
