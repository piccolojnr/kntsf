import { Link } from '@inertiajs/react';
import { Eye, RotateCcw, ShieldX, Trash2, TriangleAlert } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, markLost, revoke, show } from '@/routes/nfc-cards';
import type { NfcCard, Paginated } from '../types';
import { NfcCardReplaceDialog } from './nfc-card-replace-dialog';
import { NfcCardStatusBadge } from './nfc-card-status-badge';

export function NfcCardList({
    cards,
    canManage,
}: {
    cards: Paginated<NfcCard>;
    canManage: boolean;
}) {
    if (cards.data.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No NFC cards found
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Register a card or adjust the search.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-[0_18px_48px_rgba(17,24,19,0.06)] dark:shadow-none">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                    <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Student
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                UID
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Issued
                            </th>
                            <th className="px-4 py-3 text-right font-semibold tracking-[0.12em] uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {cards.data.map((card) => (
                            <tr
                                key={card.id}
                                className="bg-app-surface transition duration-200 hover:bg-app-surface-muted"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-app-ink">
                                        {card.student.name ?? 'Unnamed student'}
                                    </p>
                                    <p className="text-xs text-app-muted">
                                        {card.student.student_number}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    Last 4: {card.uid_last4 ?? '----'}
                                </td>
                                <td className="px-4 py-3">
                                    <NfcCardStatusBadge card={card} />
                                </td>
                                <td className="px-4 py-3 text-app-muted">
                                    {formatDate(card.issued_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link href={show(card.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>

                                        {canManage &&
                                            card.status === 'active' && (
                                                <>
                                                    <NfcCardReplaceDialog
                                                        card={card}
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <RotateCcw />
                                                                Replace
                                                            </Button>
                                                        }
                                                    />
                                                    <ConfirmActionDialog
                                                        form={markLost.form(
                                                            card.id,
                                                        )}
                                                        title="Mark NFC card as lost?"
                                                        description="This will deactivate the card and prevent it from verifying as valid."
                                                        confirmLabel="Mark lost"
                                                        variant="outline"
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <TriangleAlert />
                                                                Lost
                                                            </Button>
                                                        }
                                                    />
                                                    <ConfirmActionDialog
                                                        form={revoke.form(
                                                            card.id,
                                                        )}
                                                        title="Revoke NFC card?"
                                                        description="This will revoke the card and prevent future NFC verification with this UID."
                                                        confirmLabel="Revoke card"
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                            >
                                                                <ShieldX />
                                                                Revoke
                                                            </Button>
                                                        }
                                                    />
                                                </>
                                            )}

                                        {canManage && (
                                            <ConfirmActionDialog
                                                form={destroy.form(card.id)}
                                                title="Delete NFC card?"
                                                description="This will remove the NFC card from normal card records. Revoke or mark lost is usually preferred for lifecycle history."
                                                confirmLabel="Delete card"
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

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleDateString();
}
