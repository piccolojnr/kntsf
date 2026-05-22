import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock } from 'lucide-react';
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

            <section className="mx-auto grid w-full max-w-4xl gap-6 px-5 py-12 md:px-8">
                <div className="public-panel p-8 text-center">
                    <div className="mx-auto grid size-14 place-items-center rounded-md border border-app-border bg-app-surface-muted">
                        {issued ? (
                            <CheckCircle2 className="size-7 text-app-green" />
                        ) : (
                            <Clock className="size-7 text-app-brass" />
                        )}
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight">
                        {issued ? 'Permit issued' : 'Payment received'}
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-app-muted">
                        {issued
                            ? 'Your payment was verified and your permit has been issued.'
                            : 'Your payment was verified. This request is waiting for administrative review before issuance.'}
                    </p>
                    {permitRequest.payment?.permit_code_last4 && (
                        <p className="mt-4 text-sm font-semibold">
                            Permit code last four:{' '}
                            <span className="font-black">
                                {permitRequest.payment.permit_code_last4}
                            </span>
                        </p>
                    )}
                    <Link href={index()} className="public-action mt-6">
                        Start another request
                    </Link>
                </div>

                <PermitRequestSummary permitRequest={permitRequest} />
            </section>
        </>
    );
}
