import type { PublicPermitRequest } from '../types';
import { PermitRequestStatusBadge } from './permit-request-status-badge';

export function PermitRequestSummary({
    permitRequest,
}: {
    permitRequest: PublicPermitRequest;
}) {
    const preview = permitRequest.student.preview;
    const reviewCopy =
        permitRequest.review_status === 'rejected'
            ? 'This request was reviewed and rejected. Contact SRC administration with the reference below.'
            : permitRequest.review_status === 'approved'
              ? 'This request passed administrative review.'
              : 'This request includes a self-service student record and may require administrative review after payment.';

    return (
        <section className="public-sketch-card public-scroll-rise theme-surface rounded-[1.35rem] border border-app-border p-6 shadow-[0_18px_55px_rgba(28,24,38,0.055)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                        Permit request
                    </p>
                    <h1 className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.03em] text-app-ink">
                        {permitRequest.reference}
                    </h1>
                </div>
                <PermitRequestStatusBadge status={permitRequest.status} />
            </div>

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <Detail
                    label="Student"
                    value={preview?.name ?? 'Student record'}
                />
                <Detail
                    label="Student number"
                    value={preview?.student_number ?? 'Hidden'}
                />
                <Detail label="Course" value={preview?.course ?? 'Pending'} />
                <Detail
                    label="Level"
                    value={
                        preview?.level ? `Level ${preview.level}` : 'Pending'
                    }
                />
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
                <div className="mt-5 rounded-[1rem] border border-app-brass/50 bg-app-brass/10 px-4 py-3 text-sm leading-6 text-app-ink">
                    {reviewCopy}
                </div>
            )}
        </section>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="theme-surface-muted rounded-[1rem] border border-app-border p-3">
            <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-1 font-semibold break-words text-app-ink">
                {value}
            </p>
        </div>
    );
}
