import { Form, Head } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { AcademicPeriodDeleteDialog } from '@/features/academic-periods/components/academic-period-delete-dialog';
import { AcademicPeriodFormDialog } from '@/features/academic-periods/components/academic-period-form-dialog';
import type {
    AcademicPeriod,
    AcademicPeriodPermissions,
} from '@/features/academic-periods/types';
import { index, setActive } from '@/routes/academic-periods';

export default function AcademicPeriodsIndex({
    periods,
    can,
}: {
    periods: AcademicPeriod[];
    can: AcademicPeriodPermissions;
}) {
    const activePeriod = periods.find((period) => period.is_active);

    return (
        <>
            <Head title="Academic Periods" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Academic Periods"
                        description="Manage semesters and choose the active period for future permit issuance."
                    />

                    {can.manage && (
                        <AcademicPeriodFormDialog
                            mode="create"
                            trigger={
                                <Button>
                                    <Plus />
                                    New period
                                </Button>
                            }
                        />
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <OverviewTile
                        label="Active period"
                        value={activePeriod?.name ?? 'Not set'}
                    />
                    <OverviewTile
                        label="Configured periods"
                        value={periods.length.toString()}
                    />
                </div>

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <CardTitle>Periods</CardTitle>
                        <CardDescription>
                            Create the semester windows now. Permit tables are
                            intentionally not built yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="border-t py-4">
                        {periods.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
                                <CalendarDays className="mx-auto size-8 text-muted-foreground" />
                                <p className="mt-3 text-sm font-medium">
                                    No academic periods yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add the current semester before permit
                                    issuance begins.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-lg border">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Period
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Dates
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {periods.map((period) => (
                                                <tr
                                                    key={period.id}
                                                    className="bg-card hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {period.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {period.academic_year}
                                                            {period.semester
                                                                ? ` · ${period.semester}`
                                                                : ''}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {formatPeriodDates(period)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {period.is_active ? (
                                                            <Badge className="gap-1">
                                                                <CheckCircle2 className="size-3" />
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            {can.manage &&
                                                                !period.is_active && (
                                                                    <Form
                                                                        {...setActive.form(
                                                                            period.id,
                                                                        )}
                                                                        options={{
                                                                            preserveScroll:
                                                                                true,
                                                                        }}
                                                                    >
                                                                        {({
                                                                            processing,
                                                                        }) => (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="secondary"
                                                                                disabled={
                                                                                    processing
                                                                                }
                                                                            >
                                                                                Set active
                                                                            </Button>
                                                                        )}
                                                                    </Form>
                                                                )}

                                                            {can.manage && (
                                                                <AcademicPeriodFormDialog
                                                                    mode="edit"
                                                                    period={period}
                                                                    trigger={
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                        >
                                                                            <Pencil />
                                                                            Edit
                                                                        </Button>
                                                                    }
                                                                />
                                                            )}

                                                            {can.manage && (
                                                                <AcademicPeriodDeleteDialog
                                                                    period={period}
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
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function OverviewTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}

function formatPeriodDates(period: AcademicPeriod) {
    if (period.starts_at === null && period.ends_at === null) {
        return 'No dates set';
    }

    return `${period.starts_at ?? 'Open'} to ${period.ends_at ?? 'Open'}`;
}

AcademicPeriodsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Academic Periods',
            href: index(),
        },
    ],
};
