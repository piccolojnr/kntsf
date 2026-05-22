import { ExternalLink } from 'lucide-react';
import type { PublicPermitRequest } from '../types';

export function PaystackPaymentPanel({
    permitRequest,
}: {
    permitRequest: PublicPermitRequest;
}) {
    const authorizationUrl = permitRequest.payment?.authorization_url;
    const isPaid = ['paid', 'issued'].includes(permitRequest.status);

    return (
        <section className="public-panel p-6">
            <p className="public-kicker">Payment</p>
            <h2 className="mt-2 text-xl font-black">Paystack checkout</h2>
            <p className="mt-3 text-sm leading-6 text-app-muted">
                Payment confirmation is verified server-side. A successful
                browser redirect alone will not issue a permit.
            </p>

            <div className="mt-5 rounded-md border border-app-border bg-app-surface-muted p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-app-muted">Payment reference</span>
                    <span className="font-semibold">
                        {permitRequest.payment?.reference ?? 'Pending'}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-app-muted">Payment status</span>
                    <span className="font-semibold">
                        {permitRequest.payment?.status ?? 'pending'}
                    </span>
                </div>
            </div>

            {isPaid ? (
                <div className="mt-5 rounded-md border border-app-green/40 bg-app-green/10 px-4 py-3 text-sm font-semibold text-app-green">
                    Payment has been verified.
                </div>
            ) : authorizationUrl ? (
                <a
                    href={authorizationUrl}
                    className="public-action mt-5 w-full"
                >
                    Continue to Paystack
                    <ExternalLink className="size-4" />
                </a>
            ) : (
                <div className="mt-5 rounded-md border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm text-app-red">
                    Payment checkout is not available. Contact administration
                    with your request reference.
                </div>
            )}
        </section>
    );
}
