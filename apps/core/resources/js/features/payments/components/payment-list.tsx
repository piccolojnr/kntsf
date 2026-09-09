import { Link } from '@inertiajs/react';
import { Ban, CheckCircle2, Eye, Trash2, XCircle } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, show } from '@/routes/payments';
import { show as showPermitRequest } from '@/routes/permit-requests';
import type { Paginated, Payment, PaymentOptions } from '../types';
import { PaymentStatusBadge } from './payment-status-badge';
import { PaymentStatusDialog } from './payment-status-dialog';

export function PaymentList({
    payments,
    options,
    canManage,
}: {
    payments: Paginated<Payment>;
    options: PaymentOptions;
    canManage: boolean;
}) {
    if (payments.data.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No payments found
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Create a manual payment or adjust the filters.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-[0_18px_48px_rgba(17,24,19,0.06)] dark:shadow-none">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Reference
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Student
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Amount
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Permit
                            </th>
                            <th className="px-4 py-3 text-right font-semibold tracking-[0.12em] uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {payments.data.map((payment) => (
                            <tr
                                key={payment.id}
                                className="bg-app-surface transition duration-200 hover:bg-app-surface-muted"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-app-ink">
                                        {payment.reference}
                                    </p>
                                    <p className="text-xs text-app-muted">
                                        {payment.gateway}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-app-ink">
                                        {payment.student.name ??
                                            'Unnamed student'}
                                    </p>
                                    <p className="text-xs text-app-muted">
                                        {payment.student.student_number}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    {payment.currency} {payment.amount}
                                </td>
                                <td className="px-4 py-3">
                                    <PaymentStatusBadge payment={payment} />
                                </td>
                                <td className="px-4 py-3">
                                    <PaymentPermitLink payment={payment} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link href={show(payment.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>

                                        {canManage &&
                                            payment.status === 'pending' && (
                                                <>
                                                    <PaymentStatusDialog
                                                        payment={payment}
                                                        options={options}
                                                        action="success"
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                            >
                                                                <CheckCircle2 />
                                                                Success
                                                            </Button>
                                                        }
                                                    />
                                                    <PaymentStatusDialog
                                                        payment={payment}
                                                        options={options}
                                                        action="failed"
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <XCircle />
                                                                Failed
                                                            </Button>
                                                        }
                                                    />
                                                    <PaymentStatusDialog
                                                        payment={payment}
                                                        options={options}
                                                        action="cancel"
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Ban />
                                                                Cancel
                                                            </Button>
                                                        }
                                                    />
                                                </>
                                            )}

                                        {canManage && (
                                            <ConfirmActionDialog
                                                form={destroy.form(payment.id)}
                                                title="Delete payment?"
                                                description={`This will remove payment ${payment.reference} from normal payment records. This is a destructive action.`}
                                                confirmLabel="Delete payment"
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
    );
}

function PaymentPermitLink({ payment }: { payment: Payment }) {
    if (payment.permit) {
        return (
            <div>
                <p className="font-semibold text-app-ink">
                    Last 4: {payment.permit.code_last4 ?? '----'}
                </p>
                <p className="text-xs text-app-muted">
                    {payment.permit.status}
                </p>
            </div>
        );
    }

    if (payment.permit_request) {
        return (
            <div>
                <Button asChild variant="link" className="h-auto p-0 text-sm">
                    <Link href={showPermitRequest(payment.permit_request.id)}>
                        {payment.permit_request.reference}
                    </Link>
                </Button>
                <p className="text-xs text-app-muted">
                    {payment.permit_request.requires_review &&
                    payment.permit_request.review_status === 'pending_review'
                        ? 'Awaiting student review'
                        : payment.permit_request.status.replaceAll('_', ' ')}
                </p>
            </div>
        );
    }

    return <span className="text-app-muted">Not linked</span>;
}
