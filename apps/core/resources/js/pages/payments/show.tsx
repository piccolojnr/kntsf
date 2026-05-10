import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Ban, CheckCircle2, Trash2, XCircle } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PaymentStatusBadge } from '@/features/payments/components/payment-status-badge';
import { PaymentStatusDialog } from '@/features/payments/components/payment-status-dialog';
import type { Payment, PaymentOptions } from '@/features/payments/types';
import { destroy, index } from '@/routes/payments';

export default function PaymentShow({
    payment,
    options,
    can,
}: {
    payment: Payment;
    options: PaymentOptions;
    can: { manage: boolean };
}) {
    return (
        <>
            <Head title={payment.reference} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={payment.reference}
                        description="Payment details, linked student, and permit status."
                    />

                    <Button asChild variant="outline">
                        <Link href={index()}>
                            <ArrowLeft />
                            Back to payments
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Payment details</CardTitle>
                                <CardDescription>
                                    Manual and future gateway payment record.
                                </CardDescription>
                            </div>
                            <PaymentStatusBadge payment={payment} />
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 border-t py-4 md:grid-cols-2">
                        <Detail label="Amount" value={`${payment.currency} ${payment.amount}`} />
                        <Detail label="Gateway" value={payment.gateway} />
                        <Detail label="Paid at" value={formatDate(payment.paid_at)} />
                        <Detail label="Verified at" value={formatDate(payment.verified_at)} />
                        <Detail label="Student" value={`${payment.student.name ?? 'Unnamed student'} (${payment.student.student_number})`} />
                        <Detail
                            label="Permit"
                            value={
                                payment.permit
                                    ? `Last 4: ${payment.permit.code_last4 ?? '----'}`
                                    : 'Not linked'
                            }
                        />
                        {payment.failure_reason && (
                            <Detail
                                label="Failure reason"
                                value={payment.failure_reason}
                            />
                        )}
                    </CardContent>
                </Card>

                {can.manage && (
                    <Card className="gap-0 py-0">
                        <CardHeader className="py-4">
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>
                                Admin-only payment status updates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2 border-t py-4">
                            {payment.status === 'pending' && (
                                <>
                                    <PaymentStatusDialog
                                        payment={payment}
                                        options={options}
                                        action="success"
                                        trigger={
                                            <Button>
                                                <CheckCircle2 />
                                                Mark successful
                                            </Button>
                                        }
                                    />
                                    <PaymentStatusDialog
                                        payment={payment}
                                        options={options}
                                        action="failed"
                                        trigger={
                                            <Button variant="outline">
                                                <XCircle />
                                                Mark failed
                                            </Button>
                                        }
                                    />
                                    <PaymentStatusDialog
                                        payment={payment}
                                        options={options}
                                        action="cancel"
                                        trigger={
                                            <Button variant="outline">
                                                <Ban />
                                                Cancel payment
                                            </Button>
                                        }
                                    />
                                </>
                            )}

                            <Form
                                {...destroy.form(payment.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        <Trash2 />
                                        Delete
                                    </Button>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}

PaymentShow.layout = {
    breadcrumbs: [
        {
            title: 'Payments',
            href: index(),
        },
    ],
};
