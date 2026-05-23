import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    recovery_state: string | null;
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
    recovery,
    academicPeriods,
}: {
    permitRequests: Paginated<PermitRequestRow>;
    filters: {
        search: string;
        status: string;
        review_status: string;
        requires_review: string;
        academic_period: string;
        date_from: string | null;
        date_to: string | null;
    };
    overview: {
        total: number;
        review_required: number;
        failed: number;
        paid: number;
        awaiting_payment: number;
        issued: number;
        expired: number;
        stuck: number;
    };
    recovery: {
        paid_not_issued: number;
        awaiting_payment_expired: number;
        payment_success_request_failed: number;
        payment_without_permit: number;
    };
    academicPeriods: Array<{ id: number; label: string }>;
}) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [reviewStatus, setReviewStatus] = useState(filters.review_status);
    const [requiresReview, setRequiresReview] = useState(filters.requires_review);
    const [academicPeriod, setAcademicPeriod] = useState(filters.academic_period);
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    function submit(event: React.FormEvent) {
        event.preventDefault();
        router.get(
            index.url(),
            {
                search,
                status,
                review_status: reviewStatus,
                requires_review: requiresReview,
                academic_period: academicPeriod,
                date_from: dateFrom,
                date_to: dateTo,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Permit Requests" />

            <div className="space-y-6 p-4 md:p-6    ">
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
                    <Summary label="Pending payment" value={overview.awaiting_payment} />
                    <Summary label="Paid not issued" value={recovery.paid_not_issued} />
                    <Summary label="Needs review" value={overview.review_required} />
                    <Summary label="Issued" value={overview.issued} />
                    <Summary label="Failed" value={overview.failed} />
                    <Summary label="Expired" value={overview.expired} />
                    <Summary label="Needs recovery" value={overview.stuck} />
                </div>

                <section className="app-panel">
                    <div className="border-b border-app-border p-4">
                        <form onSubmit={submit} className="grid gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-app-muted" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search request, student number, name, email"
                                    className="pl-9"
                                />
                            </div>
                            <div className="grid gap-2 md:grid-cols-6">
                                <Select value={status} onChange={setStatus}>
                                    <option value="">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="awaiting_payment">Pending payment</option>
                                    <option value="paid">Paid</option>
                                    <option value="issued">Issued</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="expired">Expired</option>
                                </Select>
                                <Select value={reviewStatus} onChange={setReviewStatus}>
                                    <option value="">All review states</option>
                                    <option value="pending_review">Pending review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </Select>
                                <Select value={requiresReview} onChange={setRequiresReview}>
                                    <option value="">Review optional</option>
                                    <option value="1">Requires review</option>
                                    <option value="0">No review required</option>
                                </Select>
                                <Select value={academicPeriod} onChange={setAcademicPeriod}>
                                    <option value="">All periods</option>
                                    {academicPeriods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.label}
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) => setDateFrom(event.target.value)}
                                    className="w-full"
                                />
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) => setDateTo(event.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">
                                    Apply filters
                                </Button>
                            </div>
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
                                    <th className="px-4 py-3">State</th>
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
                                        <td className="px-4 py-3 text-xs text-app-muted">
                                            {permitRequest.recovery_state ?? 'Normal'}
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

function Select({
    value,
    onChange,
    children,
}: {
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-7 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
        >
            {children}
        </select>
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
