import { Head, router } from '@inertiajs/react';
import { CircleDollarSign, Clock, Search, ShieldCheck } from 'lucide-react';
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
import { PaymentCreateDialog } from '@/features/payments/components/payment-create-dialog';
import { PaymentList } from '@/features/payments/components/payment-list';
import type {
    Paginated,
    Payment,
    PaymentOptions,
} from '@/features/payments/types';
import { index } from '@/routes/payments';

export default function PaymentsIndex({
    payments,
    filters,
    overview,
    options,
    can,
}: {
    payments: Paginated<Payment>;
    filters: { search: string; status: string };
    overview: { total: number; success: number; pending: number };
    options: PaymentOptions;
    can: { manage: boolean };
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get(
            index.url(),
            { search: searchTerm || undefined, status: filters.status || undefined },
            { preserveState: true, preserveScroll: true },
        );
    }

    function filterStatus(status?: string) {
        router.get(
            index.url(),
            { search: searchTerm || undefined, status },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Payments" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Payments"
                        description="Track manual payments and linked permit issuance."
                    />

                    {can.manage && <PaymentCreateDialog options={options} />}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <OverviewTile icon={CircleDollarSign} label="Total payments" value={overview.total} />
                    <OverviewTile icon={ShieldCheck} label="Successful" value={overview.success} />
                    <OverviewTile icon={Clock} label="Pending" value={overview.pending} />
                </div>

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <CardTitle>Payment registry</CardTitle>
                        <CardDescription>
                            Search by reference, student, or gateway reference.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t py-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <form
                                onSubmit={submitSearch}
                                className="flex flex-1 flex-col gap-2 sm:flex-row"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        className="pl-9"
                                        placeholder="Search payments"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={filters.status === '' ? 'default' : 'outline'}
                                    onClick={() => filterStatus(undefined)}
                                >
                                    All
                                </Button>
                                {['pending', 'success', 'failed', 'cancelled'].map(
                                    (status) => (
                                        <Button
                                            key={status}
                                            size="sm"
                                            variant={
                                                filters.status === status
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() => filterStatus(status)}
                                        >
                                            {status}
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>

                        <PaymentList
                            payments={payments}
                            options={options}
                            canManage={can.manage}
                        />
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
    icon: typeof CircleDollarSign;
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

PaymentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Payments',
            href: index(),
        },
    ],
};
