import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, RefreshCcw, RotateCw, TimerOff, XCircle } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PermitRequestStatusBadge } from '@/features/public-permit-request/components/permit-request-status-badge';
import {
    approveReview,
    cancel,
    index,
    markExpired,
    rejectReview,
    retryIssuance,
    retryVerification,
} from '@/routes/permit-requests';

type PermitRequestDetail = {
    id: number;
    reference: string;
    status: string;
    amount: string;
    currency: string;
    contact_email: string | null;
    contact_phone: string | null;
    requires_review: boolean;
    review_status: string | null;
    student: {
        student_number: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        course: string | null;
        level: string | null;
        source: string | null;
        verification_status: string | null;
        review_notes: string | null;
    } | null;
    academic_period: {
        name: string;
        academic_year: string;
        semester: string | null;
    };
    payment: {
        reference: string;
        status: string;
        permit_id: number | null;
        permit_code_last4: string | null;
    } | null;
    recovery_state: string | null;
};

export default function PermitRequestShow({
    permitRequest,
    can,
}: {
    permitRequest: PermitRequestDetail;
    can: { review: boolean; recover: boolean };
}) {
    return (
        <>
            <Head title={permitRequest.reference} />

            <div className="space-y-6">
                <Link
                    href={index()}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-app-muted hover:text-app-ink"
                >
                    <ArrowLeft className="size-4" />
                    Back to permit requests
                </Link>

                <section className="app-panel p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="app-kicker">Permit request</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight">
                                {permitRequest.reference}
                            </h1>
                        </div>
                        <PermitRequestStatusBadge status={permitRequest.status} />
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <Detail label="Student" value={permitRequest.student?.name ?? 'Unnamed'} />
                        <Detail label="Student number" value={permitRequest.student?.student_number ?? 'Unknown'} />
                        <Detail label="Verification" value={permitRequest.student?.verification_status ?? 'Unknown'} />
                        <Detail label="Course" value={permitRequest.student?.course ?? 'Pending'} />
                        <Detail label="Level" value={permitRequest.student?.level ?? 'Pending'} />
                        <Detail label="Payment" value={permitRequest.payment?.status ?? 'No payment'} />
                        <Detail label="Email" value={permitRequest.contact_email ?? 'Missing'} />
                        <Detail label="Phone" value={permitRequest.contact_phone ?? 'Missing'} />
                        <Detail label="Amount" value={`${permitRequest.currency} ${Number(permitRequest.amount).toFixed(2)}`} />
                        <Detail label="Recovery state" value={permitRequest.recovery_state ?? 'Normal'} />
                    </div>
                </section>

                {can.recover && (
                    <section className="app-panel p-6">
                        <h2 className="text-lg font-black">Recovery actions</h2>
                        <p className="mt-2 text-sm text-app-muted">
                            Use these only when Paystack callbacks arrive late,
                            issuance fails after a verified payment, or an
                            unpaid request needs closure.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <ConfirmActionDialog
                                form={retryVerification.form(permitRequest.id)}
                                title="Retry payment verification?"
                                description="This will call Paystack server-side and update the payment/request if Paystack confirms success."
                                confirmLabel="Retry verification"
                                trigger={
                                    <Button variant="outline">
                                        <RefreshCcw />
                                        Retry verification
                                    </Button>
                                }
                            />
                            <ConfirmActionDialog
                                form={retryIssuance.form(permitRequest.id)}
                                title="Retry permit issuance?"
                                description="This will only issue a permit when the linked payment is verified. Duplicate active permits remain blocked."
                                confirmLabel="Retry issuance"
                                trigger={
                                    <Button variant="outline">
                                        <RotateCw />
                                        Retry issuance
                                    </Button>
                                }
                            />
                            <ConfirmActionDialog
                                form={markExpired.form(permitRequest.id)}
                                title="Mark request expired?"
                                description="Only unpaid pending requests should be marked expired."
                                confirmLabel="Mark expired"
                                trigger={
                                    <Button variant="outline">
                                        <TimerOff />
                                        Mark expired
                                    </Button>
                                }
                            />
                            <ConfirmActionDialog
                                form={cancel.form(permitRequest.id)}
                                title="Cancel permit request?"
                                description="This closes the request without issuing a permit. This is a destructive recovery action."
                                confirmLabel="Cancel request"
                                trigger={
                                    <Button variant="destructive">
                                        <XCircle />
                                        Cancel request
                                    </Button>
                                }
                            />
                        </div>
                    </section>
                )}

                {permitRequest.requires_review && can.review && permitRequest.review_status === 'pending_review' && (
                    <section className="app-panel p-6">
                        <h2 className="text-lg font-black">Review student record</h2>
                        <p className="mt-2 text-sm text-app-muted">
                            Approving verifies the provisional student record
                            and attempts permit issuance if payment is verified.
                        </p>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <ReviewForm
                                action={approveReview.form(permitRequest.id)}
                                buttonLabel="Approve review"
                            />
                            <ReviewForm
                                action={rejectReview.form(permitRequest.id)}
                                buttonLabel="Reject review"
                                destructive
                            />
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-app-border bg-app-surface-muted p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">
                {label}
            </p>
            <p className="mt-1 font-semibold">{value}</p>
        </div>
    );
}

function ReviewForm({
    action,
    buttonLabel,
    destructive = false,
}: {
    action: { action: string; method: 'post' };
    buttonLabel: string;
    destructive?: boolean;
}) {
    return (
        <Form {...action} className="rounded-md border border-app-border bg-app-surface-muted p-4">
            {({ processing, errors }) => (
                <div className="grid gap-3">
                    <Textarea
                        name="review_notes"
                        placeholder="Review notes"
                        className="min-h-24 bg-app-surface"
                    />
                    <InputError message={errors.review_notes} />
                    <Button
                        disabled={processing}
                        variant={destructive ? 'destructive' : 'default'}
                    >
                        {buttonLabel}
                    </Button>
                </div>
            )}
        </Form>
    );
}

PermitRequestShow.layout = {
    title: 'Permit Request',
};
