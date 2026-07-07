import { Head } from '@inertiajs/react';
import { CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { PublicPageHeader } from '@/features/public/content-card';
import { PermitFlowSteps } from '@/features/public-permit-request/components/permit-flow-steps';
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

            <PublicPageHeader
                eyebrow="Student service"
                title="Request permit"
                description="Create a student permit request, confirm your masked record, and continue to secure Paystack checkout."
            />

            <section className="relative overflow-hidden bg-[#f8f7f3]">
                <div
                    className="absolute top-16 right-[8%] size-52 rounded-full bg-app-brass/12 blur-3xl"
                    aria-hidden="true"
                />
                <div className="public-scroll-rise mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-18">
                    <div className="grid content-start gap-5">
                        <PermitFlowSteps current="lookup" />
                        <StudentLookupForm
                            settings={settings}
                            studentOptions={studentOptions}
                        />
                    </div>

                    <aside className="grid content-start gap-4">
                        <InfoCard
                            icon={<CreditCard />}
                            title="Pay securely with Paystack"
                        >
                            Permit payment is verified directly from Paystack on
                            the server before any permit is issued.
                        </InfoCard>
                        <InfoCard
                            icon={<ShieldCheck />}
                            title="Masked public lookup"
                        >
                            Public lookup only shows a masked student preview.
                            Full student records remain inside the SRC
                            dashboard.
                        </InfoCard>
                        <InfoCard
                            icon={<LockKeyhole />}
                            title="Review may be required"
                        >
                            New self-service student records may need SRC review
                            after payment before a permit is issued.
                        </InfoCard>
                    </aside>
                </div>
            </section>
        </>
    );
}

function InfoCard({
    icon,
    title,
    children,
}: {
    icon: ReactNode;
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="public-sketch-card rounded-[1.25rem] border border-app-border bg-white/64 p-5 shadow-[0_14px_42px_rgba(28,24,38,0.045)]">
            <span className="grid size-11 place-items-center rounded-full bg-app-ink/6 text-app-red [&_svg]:size-5">
                {icon}
            </span>
            <h2 className="mt-4 text-lg leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-app-muted">{children}</p>
        </div>
    );
}
