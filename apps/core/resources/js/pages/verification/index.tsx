import { Head, Link } from '@inertiajs/react';
import { History, ShieldCheck } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { NfcVerificationForm } from '@/features/verification/components/nfc-verification-form';
import { PermitCodeVerificationForm } from '@/features/verification/components/permit-code-verification-form';
import { StudentNumberVerificationForm } from '@/features/verification/components/student-number-verification-form';
import { VerificationResultCard } from '@/features/verification/components/verification-result-card';
import type {
    VerificationAttemptResult,
    VerificationOptions,
} from '@/features/verification/types';
import { index, logs } from '@/routes/verification';

export default function VerificationIndex({
    result,
    options,
    can,
}: {
    result: VerificationAttemptResult | null;
    options: VerificationOptions;
    can: { view_logs: boolean };
}) {
    return (
        <>
            <Head title="Verification" />

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel relative overflow-hidden p-5 md:p-6">
                    <div className="absolute right-6 bottom-6 size-24 rounded-full border border-dashed border-app-border opacity-70" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading
                            title="Verification"
                            description="Manually verify student numbers and permit codes."
                        />

                        {can.view_logs && (
                            <Button asChild variant="outline">
                                <Link href={logs()}>
                                    <History />
                                    View logs
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <StudentNumberVerificationForm options={options} />
                    <PermitCodeVerificationForm />
                    <NfcVerificationForm />
                </div>

                <VerificationResultCard result={result} />

                <div className="app-panel-muted p-4 text-sm text-app-muted">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-app-red" />
                        <p>
                            Submitted identifiers are hashed before they are
                            stored in verification logs. Logs show only resolved
                            student or permit references.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

VerificationIndex.layout = {
    breadcrumbs: [
        {
            title: 'Verification',
            href: index(),
        },
    ],
};
