import type { PublicPermitRequest } from '../types';
import { PermitRequestStatusBadge } from './permit-request-status-badge';

export function PermitRequestSummary({
    permitRequest,
}: {
    permitRequest: PublicPermitRequest;
}) {
    const preview = permitRequest.student.preview;

    return (
        <section className="public-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="public-kicker">Permit request</p>
                    <h1 className="mt-2 text-2xl font-black tracking-tight">
                        {permitRequest.reference}
                    </h1>
                </div>
                <PermitRequestStatusBadge status={permitRequest.status} />
            </div>

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Student" value={preview?.name ?? 'Student record'} />
                <Detail label="Student number" value={preview?.student_number ?? 'Hidden'} />
                <Detail label="Course" value={preview?.course ?? 'Pending'} />
                <Detail label="Level" value={preview?.level ? `Level ${preview.level}` : 'Pending'} />
                <Detail
                    label="Academic period"
                    value={`${permitRequest.academic_period.name} ${permitRequest.academic_period.academic_year}`}
                />
                <Detail
                    label="Amount"
                    value={`${permitRequest.currency} ${Number(permitRequest.amount).toFixed(2)}`}
                />
            </div>

            {permitRequest.requires_review && (
                <div className="mt-5 rounded-md border border-app-brass/50 bg-app-brass/10 px-4 py-3 text-sm text-app-ink">
                    This request includes a self-service student record and may
                    require administrative review after payment.
                </div>
            )}
        </section>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-app-border bg-app-surface-muted p-3">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-app-muted">
                {label}
            </p>
            <p className="mt-1 font-semibold text-app-ink">{value}</p>
        </div>
    );
}
