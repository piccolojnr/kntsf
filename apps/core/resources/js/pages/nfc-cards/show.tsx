import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, ShieldX, TriangleAlert } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { NfcCardReplaceDialog } from '@/features/nfc-cards/components/nfc-card-replace-dialog';
import { NfcCardStatusBadge } from '@/features/nfc-cards/components/nfc-card-status-badge';
import type { NfcCard } from '@/features/nfc-cards/types';
import { index, markLost, revoke } from '@/routes/nfc-cards';

export default function NfcCardShow({
    card,
    can,
}: {
    card: NfcCard;
    can: { manage: boolean };
}) {
    return (
        <>
            <Head title={`NFC Card ${card.uid_last4 ?? card.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={`NFC card ending ${card.uid_last4 ?? '----'}`}
                        description="Card lifecycle details and assigned student."
                    />

                    <Button asChild variant="outline">
                        <Link href={index()}>
                            <ArrowLeft />
                            Back to cards
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Card details</CardTitle>
                                <CardDescription>
                                    Raw NFC UID is not stored or displayed.
                                </CardDescription>
                            </div>
                            <NfcCardStatusBadge card={card} />
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 border-t py-4 md:grid-cols-2">
                        <Detail label="UID last four" value={card.uid_last4 ?? '----'} />
                        <Detail label="Student" value={`${card.student.name ?? 'Unnamed student'} (${card.student.student_number})`} />
                        <Detail label="Issued" value={formatDate(card.issued_at)} />
                        <Detail label="Activated" value={formatDate(card.activated_at)} />
                        <Detail label="Deactivated" value={formatDate(card.deactivated_at)} />
                        <Detail label="Created by" value={card.created_by?.name ?? 'Not set'} />
                    </CardContent>
                </Card>

                {can.manage && card.status === 'active' && (
                    <Card className="gap-0 py-0">
                        <CardHeader className="py-4">
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>
                                Lifecycle actions do not expose the UID.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2 border-t py-4">
                            <NfcCardReplaceDialog
                                card={card}
                                trigger={
                                    <Button variant="outline">
                                        <RotateCcw />
                                        Replace card
                                    </Button>
                                }
                            />
                            <Form
                                {...markLost.form(card.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button variant="outline" disabled={processing}>
                                        <TriangleAlert />
                                        Mark lost
                                    </Button>
                                )}
                            </Form>
                            <Form
                                {...revoke.form(card.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button variant="outline" disabled={processing}>
                                        <ShieldX />
                                        Revoke
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

NfcCardShow.layout = {
    breadcrumbs: [
        {
            title: 'NFC Cards',
            href: index(),
        },
    ],
};
