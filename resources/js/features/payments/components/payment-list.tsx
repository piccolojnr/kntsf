import { Link } from '@inertiajs/react';
import { Ban, CheckCircle2, Eye, Trash2, XCircle } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, show } from '@/routes/payments';
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
            <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No payments found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a manual payment or adjust the filters.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Reference
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Student
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Amount
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Permit
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {payments.data.map((payment) => (
                            <tr
                                key={payment.id}
                                className="bg-card hover:bg-muted/30"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-medium">{payment.reference}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {payment.gateway}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium">
                                        {payment.student.name ?? 'Unnamed student'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
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
                                    {payment.permit
                                        ? `Last 4: ${payment.permit.code_last4 ?? '----'}`
                                        : 'Not linked'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={show(payment.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>

                                        {canManage && payment.status === 'pending' && (
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
                                                        <Button size="sm" variant="outline">
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
                                                        <Button size="sm" variant="outline">
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
