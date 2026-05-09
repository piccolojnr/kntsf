import { Form, Link } from '@inertiajs/react';
import { Eye, RotateCcw, ShieldX, Trash2, TriangleAlert } from 'lucide-react';
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
            <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No NFC cards found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Register a card or adjust the search.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
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
                                                <Form
                                                    {...markLost.form(card.id)}
                                                    options={{ preserveScroll: true }}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={processing}
                                                        >
                                                            <TriangleAlert />
                                                            Lost
                                                        </Button>
                                                    )}
                                                </Form>
                                                <Form
                                                    {...revoke.form(card.id)}
                                                    options={{ preserveScroll: true }}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={processing}
                                                        >
                                                            <ShieldX />
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </Form>
                                            </>
                                        )}

                                        {canManage && (
                                            <Form
                                                {...destroy.form(card.id)}
                                                options={{ preserveScroll: true }}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={processing}
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                )}
                                            </Form>
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
