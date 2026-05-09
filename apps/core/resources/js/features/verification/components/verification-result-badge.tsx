import { Badge } from '@/components/ui/badge';
import type { VerificationResult } from '../types';

export function VerificationResultBadge({
    result,
    label,
}: {
    result: VerificationResult;
    label: string;
}) {
    const className = {
        valid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
        invalid: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
        expired: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300',
        revoked:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
        not_found:
            'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-300',
        error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
        card_inactive:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
        mismatch:
            'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300',
    }[result];

    return (
        <Badge variant="outline" className={`rounded-md px-2 py-1 ${className}`}>
            {label}
        </Badge>
    );
}
