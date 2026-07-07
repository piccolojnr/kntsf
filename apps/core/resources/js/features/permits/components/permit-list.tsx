import { Form, Link } from '@inertiajs/react';
import { CheckCircle2, Eye, Trash2, XCircle } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, markCardDelivered, show } from '@/routes/permits';
import type { Paginated, Permit, PermitPermissions } from '../types';
import { PermitRevokeDialog } from './permit-revoke-dialog';
import { PermitStatusBadge } from './permit-status-badge';

export function PermitList({
    permits,
    can,
}: {
    permits: Paginated<Permit>;
    can: PermitPermissions;
}) {
    if (permits.data.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No permits found
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Issue the first permit or adjust your search.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-[0_18px_48px_rgba(17,24,19,0.06)] dark:shadow-none">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[920px] text-sm">
                        <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                    Student
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                    Period
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                    Code
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                    Expires
                                </th>
                                <th className="px-4 py-3 text-right font-semibold tracking-[0.12em] uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {permits.data.map((permit) => (
                                <tr
                                    key={permit.id}
                                    className="bg-app-surface transition duration-200 hover:bg-app-surface-muted"
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-app-ink">
                                            {permit.student.name ??
                                                'Unnamed student'}
                                        </p>
                                        <p className="text-xs text-app-muted">
                                            {permit.student.student_number}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {permit.academic_period?.name ??
                                            'No period'}
                                    </td>
                                    <td className="px-4 py-3">
                                        Last 4: {permit.code_last4 ?? '----'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <PermitStatusBadge permit={permit} />
                                    </td>
                                    <td className="px-4 py-3 text-app-muted">
                                        {formatDate(permit.expires_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <Link href={show(permit.id)}>
                                                    <Eye />
                                                    View
                                                </Link>
                                            </Button>

                                            {can.markCardDelivered &&
                                                permit.card_delivered_at ===
                                                    null && (
                                                    <Form
                                                        {...markCardDelivered.form(
                                                            permit.id,
                                                        )}
                                                        options={{
                                                            preserveScroll: true,
                                                        }}
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                <CheckCircle2 />
                                                                Delivered
                                                            </Button>
                                                        )}
                                                    </Form>
                                                )}

                                            {can.revoke &&
                                                permit.status !== 'revoked' && (
                                                    <PermitRevokeDialog
                                                        permit={permit}
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <XCircle />
                                                                Revoke
                                                            </Button>
                                                        }
                                                    />
                                                )}

                                            {can.delete && (
                                                <ConfirmActionDialog
                                                    form={destroy.form(
                                                        permit.id,
                                                    )}
                                                    title="Delete permit?"
                                                    description={`This will remove permit ending ${permit.code_last4 ?? '----'} from normal permit records. Revocation is preferred when the permit should remain auditable.`}
                                                    confirmLabel="Delete permit"
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
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleDateString();
}
