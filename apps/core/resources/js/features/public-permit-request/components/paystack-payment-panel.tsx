import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    LockKeyhole,
} from 'lucide-react';
import type { PublicPermitRequest } from '../types';

export function PaystackPaymentPanel({
    permitRequest,
}: {
    permitRequest: PublicPermitRequest;
}) {
    const authorizationUrl = permitRequest.payment?.authorization_url;
    const isPaid = ['paid', 'issued'].includes(permitRequest.status);
    const cannotPay = ['failed', 'cancelled', 'expired'].includes(
        permitRequest.status,
    );
    const paymentStatus = permitRequest.payment?.status ?? 'pending';

    return (
        <section className="public-sketch-card public-scroll-rise theme-surface rounded-[1.35rem] border border-app-border p-6 shadow-[0_18px_55px_rgba(28,24,38,0.055)]">
            <div className="flex items-start gap-4">
                <span className="theme-ink-soft grid size-11 shrink-0 place-items-center rounded-full text-app-red">
                    <LockKeyhole className="size-5" />
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                        Payment
                    </p>
                    <h2 className="mt-2 text-xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                        Paystack checkout
                    </h2>
                </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-app-muted">
                Payment confirmation is verified server-side. A successful
                browser redirect alone will not issue a permit.
            </p>

            <div className="theme-surface-muted mt-5 rounded-[1rem] border border-app-border p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-app-muted">Payment reference</span>
                    <span className="text-right font-semibold break-all">
                        {permitRequest.payment?.reference ?? 'Pending'}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-app-muted">Payment status</span>
                    <span className="font-semibold capitalize">
                        {paymentStatus.split('_').join(' ')}
                    </span>
                </div>
            </div>

            {isPaid ? (
                <div className="border-app-green/40 bg-app-green/10 text-app-green mt-5 flex gap-3 rounded-[1rem] border px-4 py-3 text-sm font-semibold">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    Payment has been verified.
                </div>
            ) : cannotPay ? (
                <div className="mt-5 flex gap-3 rounded-[1rem] border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm leading-6 text-app-red">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    This request can no longer continue to checkout. Start a new
                    request or contact administration with your reference.
                </div>
            ) : authorizationUrl ? (
                <a
                    href={authorizationUrl}
                    className="theme-primary-action mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition"
                >
                    Continue to Paystack
                    <ExternalLink className="size-4" />
                </a>
            ) : (
                <div className="mt-5 flex gap-3 rounded-[1rem] border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm leading-6 text-app-red">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    Payment checkout is not available. Contact administration
                    with your request reference.
                </div>
            )}
        </section>
    );
}
