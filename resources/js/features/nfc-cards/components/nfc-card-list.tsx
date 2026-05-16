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
            <div className="rounded-md border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No NFC cards found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Register a card or adjust the search.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-md border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Student
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                UID
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Issued
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {cards.data.map((card) => (
                            <tr key={card.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <p className="font-medium">
                                        {card.student.name ?? 'Unnamed student'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {card.student.student_number}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    Last 4: {card.uid_last4 ?? '----'}
                                </td>
                                <td className="px-4 py-3">
                                    <NfcCardStatusBadge card={card} />
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatDate(card.issued_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={show(card.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>

                                        {canManage && card.status === 'active' && (
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
                                                    form={markLost.form(card.id)}
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
                                                    form={revoke.form(card.id)}
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
