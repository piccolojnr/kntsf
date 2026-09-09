import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    KeyRound,
    Mail,
    Pencil,
    Phone,
    Trash2,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
import { StudentActivateAccountDialog } from '@/features/students/components/student-activate-account-dialog';
import { StudentDeleteDialog } from '@/features/students/components/student-delete-dialog';
import { StudentFormDialog } from '@/features/students/components/student-form-dialog';
import { AccountStatus } from '@/features/students/components/student-list';
import type { Student, StudentFormOptions } from '@/features/students/types';
import { index } from '@/routes/students';

export default function ShowStudent({
    student,
    options,
    can,
}: {
    student: Student;
    options: StudentFormOptions;
    can: { update: boolean; delete: boolean; activateAccount: boolean };
}) {
    return (
        <>
            <Head title={student.student_number} />

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to students
                    </Link>
                </Button>

                <div className="app-panel p-5 md:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading
                            title={student.name ?? 'Unnamed student'}
                            description={`Student number ${student.student_number}`}
                        />

                        <div className="flex gap-2">
                            {can.activateAccount &&
                                student.account_status !== 'activated' && (
                                    <StudentActivateAccountDialog
                                        student={student}
                                        trigger={
                                            <Button variant="secondary">
                                                <KeyRound />
                                                {student.account_status ===
                                                'pending_setup'
                                                    ? 'Resend setup'
                                                    : 'Activate account'}
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
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="app-panel gap-0 overflow-hidden py-0">
                        <CardHeader className="border-b border-app-border py-4">
                            <CardTitle>Student profile</CardTitle>
                            <CardDescription>
                                Core profile fields used across student
                                operations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
                            <Detail
                                icon={UserRound}
                                label="Student number"
                                value={student.student_number}
                            />
                            <Detail
                                icon={BookOpen}
                                label="Course"
                                value={student.course}
                            />
                            <Detail
                                icon={BookOpen}
                                label="Level"
                                value={
                                    student.level
                                        ? `Level ${student.level}`
                                        : null
                                }
                            />
                            <Detail
                                icon={Mail}
                                label="Email"
                                value={student.email}
                            />
                            <Detail
                                icon={Phone}
                                label="Phone"
                                value={student.phone}
                            />
                            <Detail
                                icon={UserRound}
                                label="Linked user"
                                value={student.user?.email ?? null}
                            />
                        </CardContent>
                    </Card>

                    <Card className="app-panel gap-0 overflow-hidden py-0">
                        <CardHeader className="border-b border-app-border py-4">
                            <CardTitle>Account readiness</CardTitle>
                            <CardDescription>
                                Student login access is handled through account
                                activation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 py-4">
                            <div className="app-panel-muted flex items-center justify-between p-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Current state
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {student.account_status_label}
                                    </p>
                                </div>
                                <AccountStatus student={student} />
                            </div>

                            <div className="space-y-2 text-sm">
                                <ReadinessRow
                                    label="Email available"
                                    complete={student.email !== null}
                                />
                                <ReadinessRow
                                    label="User linked"
                                    complete={student.user !== null}
                                />
                                <ReadinessRow
                                    label="Password setup complete"
                                    complete={
                                        student.account_status === 'activated'
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="app-panel max-w-3xl gap-0 overflow-hidden py-0">
                    <CardHeader className="py-4">
                        <CardTitle>Configured options</CardTitle>
                        <CardDescription>
                            These lists come from app settings and can be
                            expanded later from a settings screen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2 border-t border-app-border py-4">
                        {options.levels.map((level) => (
                            <Badge key={level.value} variant="outline">
                                Level {level.label}
                            </Badge>
                        ))}
                        <Badge variant="secondary">
                            Prefix {options.student_number_prefix}
                        </Badge>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string | null;
}) {
    return (
        <div className="app-panel-muted flex gap-3 p-4">
            <div className="theme-ink-soft flex size-8 shrink-0 items-center justify-center rounded-md text-app-red">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <dt className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                    {label}
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-app-ink">
                    {value ?? 'Not provided'}
                </dd>
            </div>
        </div>
    );
}

function ReadinessRow({
    label,
    complete,
}: {
    label: string;
    complete: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-app-muted">{label}</span>
            <Badge variant={complete ? 'secondary' : 'outline'}>
                {complete ? 'Ready' : 'Pending'}
            </Badge>
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
