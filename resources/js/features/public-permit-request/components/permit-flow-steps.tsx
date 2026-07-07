import { CheckCircle2, CreditCard, Search, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

type PermitFlowStage = 'lookup' | 'payment' | 'complete';

const steps: {
    key: PermitFlowStage;
    title: string;
    description: string;
    icon: ReactNode;
}[] = [
    {
        key: 'lookup',
        title: 'Find record',
        description: 'Check the student number.',
        icon: <Search className="size-4" />,
    },
    {
        key: 'payment',
        title: 'Pay securely',
        description: 'Continue through Paystack.',
        icon: <CreditCard className="size-4" />,
    },
    {
        key: 'complete',
        title: 'Permit status',
        description: 'Confirm issuance or review.',
        icon: <ShieldCheck className="size-4" />,
    },
];

const stageOrder: Record<PermitFlowStage, number> = {
    lookup: 0,
    payment: 1,
    complete: 2,
};

export function PermitFlowSteps({ current }: { current: PermitFlowStage }) {
    const currentIndex = stageOrder[current];

    return (
        <div className="public-sketch-card public-scroll-rise rounded-[1.2rem] border border-app-border bg-white/68 p-2 shadow-[0_14px_44px_rgba(28,24,38,0.045)]">
            <div className="grid gap-2 md:grid-cols-3">
                {steps.map((step, index) => {
                    const isComplete = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div
                            key={step.key}
                            className={`rounded-[1rem] border px-4 py-3 transition duration-300 ${
                                isActive
                                    ? 'border-app-ink bg-app-ink text-white shadow-[0_14px_32px_rgba(28,24,38,0.16)]'
                                    : isComplete
                                      ? 'border-app-green/30 bg-app-green/10 text-app-ink'
                                      : 'border-transparent bg-[#f8f7f3]/68 text-app-muted'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
                                        isActive
                                            ? 'bg-white/14 text-white'
                                            : isComplete
                                              ? 'text-app-green bg-white'
                                              : 'bg-white text-app-muted'
                                    }`}
                                >
                                    {isComplete ? (
                                        <CheckCircle2 className="size-4" />
                                    ) : (
                                        step.icon
                                    )}
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold">
                                        {step.title}
                                    </span>
                                    <span
                                        className={`mt-1 block text-xs leading-5 ${
                                            isActive
                                                ? 'text-white/70'
                                                : 'text-app-muted'
                                        }`}
                                    >
                                        {step.description}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
