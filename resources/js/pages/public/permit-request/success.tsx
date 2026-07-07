import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { PermitFlowSteps } from '@/features/public-permit-request/components/permit-flow-steps';
import { PermitRequestSummary } from '@/features/public-permit-request/components/permit-request-summary';
import type { PublicPermitRequest } from '@/features/public-permit-request/types';
import { index } from '@/routes/public/permit-request';

export default function PublicPermitRequestSuccess({
    permitRequest,
}: {
    permitRequest: PublicPermitRequest;
}) {
    const issued = permitRequest.status === 'issued';

    return (
        <>
            <Head title="Permit Request Status" />

            <section className="relative overflow-hidden bg-[#f8f7f3]">
                <div
                    className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                    aria-hidden="true"
                />
                <div
                    className="absolute top-20 right-[10%] size-52 rounded-full bg-app-brass/12 blur-3xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise relative mx-auto grid w-full max-w-5xl gap-6 px-5 pt-32 pb-16 md:px-8 lg:pt-36">
                    <PermitFlowSteps current="complete" />

                    <div className="public-sketch-card rounded-[1.5rem] border border-app-border bg-white/76 p-8 text-center shadow-[0_20px_60px_rgba(28,24,38,0.07)]">
                        <div
                            className={`mx-auto grid size-16 place-items-center rounded-full border ${
                                issued
                                    ? 'border-app-green/35 bg-app-green/10 text-app-green'
                                    : 'border-app-brass/45 bg-app-brass/12 text-app-ink'
                            }`}
                        >
                            {issued ? (
                                <CheckCircle2 className="size-8" />
                            ) : (
                                <Clock className="size-8" />
                            )}
                        </div>
                        <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                            Permit status
                        </p>
                        <h1 className="mx-auto mt-3 max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.03em] text-app-ink md:text-5xl">
                            {issued ? 'Permit issued' : 'Payment received'}
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-app-muted">
                            {issued
                                ? 'Your payment was verified and your permit has been issued.'
                                : 'Your payment was verified. This request is waiting for administrative review before issuance.'}
                        </p>
                        {permitRequest.payment?.permit_code_last4 && (
                            <p className="mx-auto mt-5 max-w-sm rounded-full border border-app-border bg-[#f8f7f3]/74 px-4 py-2 text-sm font-semibold text-app-ink">
                                Permit code last four:{' '}
                                <span className="font-bold">
                                    {permitRequest.payment.permit_code_last4}
                                </span>
                            </p>
                        )}
                        <Link
                            href={index()}
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-app-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-app-red"
                        >
                            Start another request
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    <PermitRequestSummary permitRequest={permitRequest} />
                </div>
            </section>
        </>
    );
}
