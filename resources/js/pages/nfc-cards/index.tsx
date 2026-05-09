import { Head, router } from '@inertiajs/react';
import { CreditCard, Search, ShieldCheck, Wifi } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NfcCardList } from '@/features/nfc-cards/components/nfc-card-list';
import { NfcCardRegisterDialog } from '@/features/nfc-cards/components/nfc-card-register-dialog';
import type {
    NfcCard,
    NfcCardOptions,
    Paginated,
} from '@/features/nfc-cards/types';
import { index } from '@/routes/nfc-cards';

export default function NfcCardsIndex({
    cards,
    filters,
    overview,
    options,
    can,
}: {
    cards: Paginated<NfcCard>;
    filters: { search: string };
    overview: { total: number; active: number; inactive: number };
    options: NfcCardOptions;
    can: { manage: boolean };
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get(
            index.url(),
            { search: searchTerm || undefined },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="NFC Cards" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="NFC Cards"
                        description="Register and manage student NFC card assignments."
                    />

                    {can.manage && <NfcCardRegisterDialog options={options} />}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <OverviewTile icon={CreditCard} label="Total cards" value={overview.total} />
                    <OverviewTile icon={ShieldCheck} label="Active cards" value={overview.active} />
                    <OverviewTile icon={Wifi} label="Inactive cards" value={overview.inactive} />
                </div>

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <CardTitle>NFC registry</CardTitle>
                        <CardDescription>
                            Search by student, student number, or UID last four.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t py-4">
                        <form
                            onSubmit={submitSearch}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    className="pl-9"
                                    placeholder="Search NFC cards"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>

                        <NfcCardList cards={cards} canManage={can.manage} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function OverviewTile({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof CreditCard;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

NfcCardsIndex.layout = {
    breadcrumbs: [
        {
            title: 'NFC Cards',
            href: index(),
        },
    ],
};
