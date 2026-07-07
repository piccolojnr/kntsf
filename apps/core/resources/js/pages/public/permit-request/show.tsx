import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, CreditCard } from 'lucide-react';
import { PaystackPaymentPanel } from '@/features/public-permit-request/components/paystack-payment-panel';
import { PermitFlowSteps } from '@/features/public-permit-request/components/permit-flow-steps';
import { PermitRequestSummary } from '@/features/public-permit-request/components/permit-request-summary';
import type { PublicPermitRequest } from '@/features/public-permit-request/types';
import { index } from '@/routes/public/permit-request';

export default function PublicPermitRequestShow({
    permitRequest,
}: {
    permitRequest: PublicPermitRequest;
}) {
    return (
        <>
            <Head title={`Permit Request ${permitRequest.reference}`} />

            <section className="relative overflow-hidden bg-[#f8f7f3]">
                <div
                    className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                    aria-hidden="true"
                />
                <div
                    className="absolute top-20 right-[8%] size-52 rounded-full bg-app-brass/12 blur-3xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise relative mx-auto grid w-full max-w-7xl gap-8 px-5 pt-32 pb-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pt-36 lg:pb-18">
                    <div>
                        <Link
                            href={index()}
                            className="public-drawn-link inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-app-muted uppercase transition hover:text-app-red"
                        >
                            <ArrowLeft className="size-4" />
                            New request
                        </Link>
                        <h1 className="mt-8 max-w-4xl text-4xl leading-[1.04] font-semibold tracking-[-0.03em] text-app-ink md:text-6xl">
                            Continue permit request
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-app-muted">
                            Review the request details, then continue to
                            Paystack if checkout is available.
                        </p>
                        <div className="mt-7">
                            <PermitFlowSteps current="payment" />
                        </div>
                        <div className="mt-8">
                            <PermitRequestSummary
                                permitRequest={permitRequest}
                            />
                        </div>
                    </div>

                    <aside className="grid content-end gap-4">
                        <div className="public-sketch-card rounded-[1.25rem] border border-app-border bg-white/64 p-5 shadow-[0_14px_42px_rgba(28,24,38,0.045)]">
                            <CreditCard className="size-5 text-app-red" />
                            <p className="mt-4 text-sm leading-7 text-app-muted">
                                If payment succeeds, return through the Paystack
                                callback so the server can verify the
                                transaction.
                            </p>
                        </div>
                        <div className="public-sketch-card rounded-[1.25rem] border border-app-border bg-white/64 p-5 shadow-[0_14px_42px_rgba(28,24,38,0.045)]">
                            <Clock className="size-5 text-app-red" />
                            <p className="mt-4 text-sm leading-7 text-app-muted">
                                Some requests wait for administrative review
                                before the final permit is issued.
                            </p>
                        </div>
                        <PaystackPaymentPanel permitRequest={permitRequest} />
                    </aside>
                </div>
            </section>
        </>
    );
}
