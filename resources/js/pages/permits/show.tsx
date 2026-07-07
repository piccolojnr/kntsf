import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PermitRevokeDialog } from '@/features/permits/components/permit-revoke-dialog';
import { PermitStatusBadge } from '@/features/permits/components/permit-status-badge';
import type { Permit } from '@/features/permits/types';
import { index, markCardDelivered } from '@/routes/permits';

export default function ShowPermit({
    permit,
    issuedPermitCode,
    can,
}: {
    permit: Permit;
    issuedPermitCode?: string | null;
    can: { revoke: boolean; markCardDelivered: boolean; delete: boolean };
}) {
    return (
        <>
            <Head title={`Permit ${permit.code_last4 ?? permit.id}`} />

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <Button asChild variant="ghost" className="w-fit">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back to permits
                    </Link>
                </Button>

                <div className="app-panel relative overflow-hidden p-5 md:p-6">
                    <div className="absolute right-6 bottom-6 size-24 rounded-full border border-dashed border-app-border opacity-70" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading
                            title={`Permit ending ${permit.code_last4 ?? '----'}`}
                            description={`${permit.student.student_number} · ${permit.student.name ?? 'Unnamed student'}`}
                        />

                        <div className="flex gap-2">
                            {can.markCardDelivered &&
                                permit.card_delivered_at === null && (
                                    <Form
                                        {...markCardDelivered.form(permit.id)}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="secondary"
                                                disabled={processing}
                                            >
                                                <CheckCircle2 />
                                                Mark delivered
                                            </Button>
                                        )}
                                    </Form>
                                )}

                            {can.revoke && permit.status !== 'revoked' && (
                                <PermitRevokeDialog
                                    permit={permit}
                                    trigger={
                                        <Button variant="destructive">
                                            <XCircle />
                                            Revoke
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>

                {issuedPermitCode && (
                    <div className="rounded-2xl border border-app-brass/45 bg-app-brass/12 p-4 text-sm text-app-ink">
                        <p className="font-medium">One-time permit code</p>
                        <p className="mt-1">
                            Code:{' '}
                            <span className="font-mono">
                                {issuedPermitCode}
                            </span>
                        </p>
                        <p className="mt-1 text-xs">
                            This code will not be shown again and is not stored
                            in plaintext.
                        </p>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="app-panel gap-0 overflow-hidden py-0">
                        <CardHeader className="border-b border-app-border py-4">
                            <CardTitle>Permit details</CardTitle>
                            <CardDescription>
                                Public code is represented only by last four
                                characters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
                            <Detail label="Status">
                                <PermitStatusBadge permit={permit} />
                            </Detail>
                            <Detail
                                label="Code last four"
                                value={permit.code_last4 ?? '----'}
                            />
                            <Detail
                                label="Starts"
                                value={formatDate(permit.starts_at)}
                            />
                            <Detail
                                label="Expires"
                                value={formatDate(permit.expires_at)}
                            />
                            <Detail
                                label="Amount"
                                value={`${permit.currency} ${permit.amount_paid}`}
                            />
                            <Detail
                                label="Card delivered"
                                value={
                                    permit.card_delivered_at
                                        ? formatDate(permit.card_delivered_at)
                                        : 'Not delivered'
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="app-panel gap-0 overflow-hidden py-0">
                        <CardHeader className="border-b border-app-border py-4">
                            <CardTitle>Student</CardTitle>
                            <CardDescription>
                                Permit owner summary.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 py-4">
                            <Detail
                                label="Student number"
                                value={permit.student.student_number}
                            />
                            <Detail
                                label="Name"
                                value={permit.student.name ?? 'Unnamed student'}
                            />
                            <Detail
                                label="Course"
                                value={permit.student.course ?? 'Not provided'}
                            />
                            <Detail
                                label="Level"
                                value={
                                    permit.student.level
                                        ? `Level ${permit.student.level}`
                                        : 'Not provided'
                                }
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card className="app-panel max-w-3xl gap-0 overflow-hidden py-0">
                    <CardHeader className="border-b border-app-border py-4">
                        <CardTitle>Academic period</CardTitle>
                        <CardDescription>
                            Semester linkage for this permit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
                        <Detail
                            label="Period"
                            value={permit.academic_period?.name ?? 'No period'}
                        />
                        <Detail
                            label="Academic year"
                            value={
                                permit.academic_period?.academic_year ??
                                'Not provided'
                            }
                        />
                        <Detail
                            label="Semester"
                            value={
                                permit.academic_period?.semester ??
                                'Not provided'
                            }
                        />
                        <Detail
                            label="Issued by"
                            value={permit.issued_by?.name ?? 'Not provided'}
                        />
                    </CardContent>
                </Card>

                {permit.status === 'revoked' && (
                    <Card className="app-panel max-w-3xl gap-0 overflow-hidden py-0">
                        <CardHeader className="border-b border-app-border py-4">
                            <CardTitle>Revocation</CardTitle>
                            <CardDescription>
                                Revoked permit audit details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
                            <Detail
                                label="Revoked at"
                                value={formatDate(permit.revoked_at)}
                            />
                            <Detail
                                label="Revoked by"
                                value={
                                    permit.revoked_by?.name ?? 'Not provided'
                                }
                            />
                            <div className="sm:col-span-2">
                                <Detail
                                    label="Reason"
                                    value={
                                        permit.revocation_reason ??
                                        'No reason provided'
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function Detail({
    label,
    value,
    children,
}: {
    label: string;
    value?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="app-panel-muted p-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                {label}
            </p>
            <div className="mt-1 text-sm font-semibold text-app-ink">
                {children ?? value ?? 'Not provided'}
            </div>
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}

ShowPermit.layout = {
    breadcrumbs: [
        {
            title: 'Permits',
            href: index(),
        },
        {
            title: 'Details',
            href: '#',
        },
    ],
};
