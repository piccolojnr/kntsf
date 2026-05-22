import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PaystackPaymentPanel } from '@/features/public-permit-request/components/paystack-payment-panel';
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

            <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-12 md:px-8 lg:grid-cols-[1fr_0.75fr]">
                <div className="space-y-4">
                    <Link
                        href={index()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-app-muted hover:text-app-ink"
                    >
                        <ArrowLeft className="size-4" />
                        New request
                    </Link>
                    <PermitRequestSummary permitRequest={permitRequest} />
                </div>
                <PaystackPaymentPanel permitRequest={permitRequest} />
            </section>
        </>
    );
}
