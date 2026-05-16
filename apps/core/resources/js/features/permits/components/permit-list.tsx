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
            <div className="rounded-md border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No permits found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Issue the first permit or adjust your search.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-md border bg-card">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[920px] text-sm">
                        <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    Student
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Period
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Code
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Expires
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {permits.data.map((permit) => (
                                <tr
                                    key={permit.id}
                                    className="bg-card hover:bg-muted/30"
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium">
                                            {permit.student.name ??
                                                'Unnamed student'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
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
                                    <td className="px-4 py-3 text-muted-foreground">
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
                                                            preserveScroll:
                                                                true,
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
                                                    form={destroy.form(permit.id)}
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
