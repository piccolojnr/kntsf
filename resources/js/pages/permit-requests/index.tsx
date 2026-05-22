import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { PermitRequestStatusBadge } from '@/features/public-permit-request/components/permit-request-status-badge';
import { index, show } from '@/routes/permit-requests';

type PermitRequestRow = {
    id: number;
    reference: string;
    status: string;
    amount: string;
    currency: string;
    requires_review: boolean;
    review_status: string | null;
    created_at: string | null;
    student: {
        student_number: string;
        name: string | null;
        course: string | null;
        level: string | null;
        verification_status: string | null;
    } | null;
    payment: {
        reference: string;
        status: string;
        permit_id: number | null;
    } | null;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function PermitRequestsIndex({
    permitRequests,
    filters,
    overview,
}: {
    permitRequests: Paginated<PermitRequestRow>;
    filters: { search: string; status: string };
    overview: {
        total: number;
        review_required: number;
        failed: number;
        paid: number;
    };
}) {
    const [search, setSearch] = useState(filters.search);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        router.get(index.url(), { search }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Permit Requests" />

            <div className="space-y-6">
                <div>
                    <p className="app-kicker">Self-service</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight">
                        Permit Requests
                    </h1>
                    <p className="mt-2 text-sm text-app-muted">
                        Review public self-service requests, failed payments,
                        and paid requests waiting for issuance.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Summary label="Total" value={overview.total} />
                    <Summary label="Needs review" value={overview.review_required} />
                    <Summary label="Paid" value={overview.paid} />
                    <Summary label="Failed" value={overview.failed} />
                </div>

                <section className="app-panel">
                    <div className="border-b border-app-border p-4">
                        <form onSubmit={submit} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-app-muted" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search request, student number, name, email"
                                    className="h-9 w-full rounded-md border border-app-border bg-app-surface pl-9 text-sm"
                                />
                            </div>
                            <button className="rounded-md bg-app-ink px-4 text-xs font-black uppercase tracking-[0.14em] text-app-surface">
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-app-border bg-app-surface-muted text-left text-xs uppercase tracking-[0.14em] text-app-muted">
                                <tr>
                                    <th className="px-4 py-3">Request</th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Review</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permitRequests.data.map((permitRequest) => (
                                    <tr
                                        key={permitRequest.id}
                                        className="border-b border-app-border last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={show(permitRequest.id)}
                                                className="font-black text-app-ink hover:text-app-red"
                                            >
                                                {permitRequest.reference}
                                            </Link>
                                            <div className="mt-1">
                                                <PermitRequestStatusBadge
                                                    status={permitRequest.status}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold">
                                                {permitRequest.student?.name ?? 'Unnamed'}
                                            </p>
                                            <p className="text-xs text-app-muted">
                                                {permitRequest.student?.student_number}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-app-muted">
                                            {permitRequest.payment?.reference ?? 'No payment'}
                                            <br />
                                            {permitRequest.payment?.status ?? ''}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-app-muted">
                                            {permitRequest.requires_review
                                                ? permitRequest.review_status
                                                : 'Not required'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {permitRequest.currency}{' '}
                                            {Number(permitRequest.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}

function Summary({ label, value }: { label: string; value: number }) {
    return (
        <div className="app-panel-muted p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-app-muted">
                {label}
            </p>
            <p className="mt-2 text-2xl font-black">{value}</p>
        </div>
    );
}

PermitRequestsIndex.layout = {
    title: 'Permit Requests',
};
