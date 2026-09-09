import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Banknote, ClipboardCheck, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExportMenu } from '@/components/shared/export-menu';
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
    const [requiresReview, setRequiresReview] = useState(
        filters.requires_review,
    );
    const [academicPeriod, setAcademicPeriod] = useState(
        filters.academic_period,
    );
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

            <div className="app-page space-y-5 p-4 md:p-6">
                <div className="app-panel relative overflow-hidden p-5 md:p-6">
                    <div className="absolute right-6 bottom-6 size-24 rounded-full border border-dashed border-app-border opacity-70" />
                    <div className="relative">
                        <p className="app-kicker">Self-service</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-app-ink">
                            Permit Requests
                        </h1>
                        <p className="mt-2 text-sm text-app-muted">
                            Review public self-service requests, failed
                            payments, and paid requests waiting for issuance.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Summary
                        icon={ClipboardCheck}
                        label="Total"
                        value={overview.total}
                    />
                    <Summary
                        icon={Banknote}
                        label="Pending payment"
                        value={overview.awaiting_payment}
                    />
                    <Summary
                        icon={AlertTriangle}
                        label="Paid not issued"
                        value={recovery.paid_not_issued}
                    />
                    <Summary
                        icon={ClipboardCheck}
                        label="Needs review"
                        value={overview.review_required}
                    />
                    <Summary label="Issued" value={overview.issued} />
                    <Summary label="Failed" value={overview.failed} />
                    <Summary label="Expired" value={overview.expired} />
                    <Summary label="Needs recovery" value={overview.stuck} />
                </div>

                <section className="app-panel overflow-hidden">
                    <div className="border-b border-app-border p-4">
                        <form onSubmit={submit} className="grid gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-app-muted" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search request, student number, name, email"
                                    className="rounded-xl border-app-border bg-app-surface pl-9"
                                />
                            </div>
                            <div className="grid gap-2 md:grid-cols-6">
                                <Select value={status} onChange={setStatus}>
                                    <option value="">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="awaiting_payment">
                                        Pending payment
                                    </option>
                                    <option value="paid">Paid</option>
                                    <option value="issued">Issued</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="expired">Expired</option>
                                </Select>
                                <Select
                                    value={reviewStatus}
                                    onChange={setReviewStatus}
                                >
                                    <option value="">All review states</option>
                                    <option value="pending_review">
                                        Pending review
                                    </option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </Select>
                                <Select
                                    value={requiresReview}
                                    onChange={setRequiresReview}
                                >
                                    <option value="">Review optional</option>
                                    <option value="1">Requires review</option>
                                    <option value="0">
                                        No review required
                                    </option>
                                </Select>
                                <Select
                                    value={academicPeriod}
                                    onChange={setAcademicPeriod}
                                >
                                    <option value="">All periods</option>
                                    {academicPeriods.map((period) => (
                                        <option
                                            key={period.id}
                                            value={period.id}
                                        >
                                            {period.label}
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) =>
                                        setDateFrom(event.target.value)
                                    }
                                    className="w-full"
                                />
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) =>
                                        setDateTo(event.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <ExportMenu
                                    resource="permit-requests"
                                    filters={filters}
                                />
                                <Button type="submit">Apply filters</Button>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead className="border-b border-app-border bg-app-surface-muted text-left text-xs text-app-muted">
                                <tr>
                                    <th className="px-4 py-3 font-semibold tracking-[0.12em] uppercase">
                                        Request
                                    </th>
                                    <th className="px-4 py-3 font-semibold tracking-[0.12em] uppercase">
                                        Student
                                    </th>
                                    <th className="px-4 py-3 font-semibold tracking-[0.12em] uppercase">
                                        Payment
                                    </th>
                                    <th className="px-4 py-3 font-semibold tracking-[0.12em] uppercase">
                                        Review
                                    </th>
                                    <th className="px-4 py-3 font-semibold tracking-[0.12em] uppercase">
                                        State
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold tracking-[0.12em] uppercase">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-app-border">
                                {permitRequests.data.map((permitRequest) => (
                                    <tr
                                        key={permitRequest.id}
                                        className="bg-app-surface transition duration-200 hover:bg-app-surface-muted"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={show(permitRequest.id)}
                                                className="font-semibold text-app-ink transition hover:text-app-red"
                                            >
                                                {permitRequest.reference}
                                            </Link>
                                            <div className="mt-1">
                                                <PermitRequestStatusBadge
                                                    status={
                                                        permitRequest.status
                                                    }
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-app-ink">
                                                {permitRequest.student?.name ??
                                                    'Unnamed'}
                                            </p>
                                            <p className="text-xs text-app-muted">
                                                {
                                                    permitRequest.student
                                                        ?.student_number
                                                }
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-app-muted">
                                            {permitRequest.payment?.reference ??
                                                'No payment'}
                                            <br />
                                            {permitRequest.payment?.status ??
                                                ''}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-app-muted">
                                            {permitRequest.requires_review
                                                ? permitRequest.review_status
                                                : 'Not required'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-app-muted">
                                            {permitRequest.recovery_state ??
                                                'Normal'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {permitRequest.currency}{' '}
                                            {Number(
                                                permitRequest.amount,
                                            ).toFixed(2)}
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
            className="h-10 rounded-xl border border-app-border bg-app-surface px-3 py-1 text-xs text-app-ink transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
            {children}
        </select>
    );
}

function Summary({
    icon: Icon = ClipboardCheck,
    label,
    value,
}: {
    icon?: typeof ClipboardCheck;
    label: string;
    value: number;
}) {
    return (
        <div className="app-panel-muted flex items-center gap-3 p-4 transition duration-300 hover:-translate-y-0.5">
            <div className="theme-primary-active grid size-10 shrink-0 place-items-center rounded-xl">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                    {label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-app-ink tabular-nums">
                    {value}
                </p>
            </div>
        </div>
    );
}

PermitRequestsIndex.layout = {
    title: 'Permit Requests',
};
