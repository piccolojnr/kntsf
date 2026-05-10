import { Badge } from '@/components/ui/badge';
import type { Payment } from '../types';

export function PaymentStatusBadge({ payment }: { payment: Payment }) {
    const className = {
        pending:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
        success:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
        failed: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
        cancelled:
            'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300',
    }[payment.status];

    return (
        <Badge variant="outline" className={`rounded-md px-2 py-1 ${className}`}>
            {payment.status_label}
        </Badge>
    );
}
