import { Head } from '@inertiajs/react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { StudentLookupForm } from '@/features/public-permit-request/components/student-lookup-form';
import type {
    PermitRequestSettings,
    PublicPermitStudentOptions,
} from '@/features/public-permit-request/types';

export default function PublicPermitRequestIndex({
    settings,
    studentOptions,
}: {
    settings: PermitRequestSettings;
    studentOptions: PublicPermitStudentOptions;
}) {
    return (
        <>
            <Head title="Request Permit" />

            <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 md:px-8 lg:grid-cols-[1fr_0.72fr] lg:py-16">
                <StudentLookupForm
                    settings={settings}
                    studentOptions={studentOptions}
                />

                <aside className="grid content-start gap-4">
                    <div className="public-panel-muted p-6">
                        <CreditCard className="size-6 text-app-red" />
                        <h2 className="mt-4 text-xl font-black">
                            Pay securely with Paystack
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-app-muted">
                            Permit payment is verified directly from Paystack on
                            the server before any permit is issued.
                        </p>
                    </div>
                    <div className="public-panel-muted p-6">
                        <ShieldCheck className="size-6 text-app-teal" />
                        <h2 className="mt-4 text-xl font-black">
                            Your details stay private
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-app-muted">
                            Public lookup only shows a masked student preview.
                            Full student records remain inside the SRC dashboard.
                        </p>
                    </div>
                </aside>
            </section>
        </>
    );
}
