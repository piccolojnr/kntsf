import { CheckCircle2, CircleAlert, Clock, ShieldX } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { VerificationAttemptResult } from '../types';
import { VerificationResultBadge } from './verification-result-badge';

export function VerificationResultCard({
    result,
}: {
    result: VerificationAttemptResult | null;
}) {
    if (!result) {
        return (
            <Card className="app-panel gap-0 overflow-hidden py-0">
                <CardHeader className="py-4">
                    <CardTitle>Verification result</CardTitle>
                    <CardDescription>
                        Submit a student number or permit code to see the
                        result.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const Icon = {
        valid: CheckCircle2,
        invalid: CircleAlert,
        expired: Clock,
        revoked: ShieldX,
        not_found: CircleAlert,
        error: ShieldX,
        card_inactive: CircleAlert,
        mismatch: CircleAlert,
    }[result.result];

    return (
        <Card className="app-panel gap-0 overflow-hidden py-0">
            <CardHeader className="py-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Icon className="size-5" />
                            Verification result
                        </CardTitle>
                        <CardDescription>{result.method_label}</CardDescription>
                    </div>
                    <VerificationResultBadge
                        result={result.result}
                        label={result.result_label}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4 border-t border-app-border py-4 text-sm">
                {result.reason && (
                    <p className="text-app-muted">{result.reason}</p>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                    <DetailBlock
                        label="Student"
                        value={
                            result.student
                                ? `${result.student.name ?? 'Unnamed student'} (${result.student.student_number})`
                                : 'Not resolved'
                        }
                    />
                    <DetailBlock
                        label="Permit"
                        value={
                            result.permit
                                ? `Last 4: ${result.permit.code_last4 ?? '----'}`
                                : 'Not resolved'
                        }
                    />
                    <DetailBlock
                        label="Academic period"
                        value={
                            result.permit?.academic_period?.name ?? 'Not set'
                        }
                    />
                    <DetailBlock
                        label="Expires"
                        value={formatDate(result.permit?.expires_at ?? null)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="app-panel-muted p-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-1 font-semibold text-app-ink">{value}</p>
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}
