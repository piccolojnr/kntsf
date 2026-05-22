import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
    pending: 'border-app-border bg-app-surface-muted text-app-muted',
    awaiting_payment: 'border-app-brass/50 bg-app-brass/15 text-app-ink',
    paid: 'border-app-teal/40 bg-app-teal/10 text-app-teal',
    issued: 'border-app-green/40 bg-app-green/10 text-app-green',
    failed: 'border-app-red/40 bg-app-red/10 text-app-red',
    cancelled: 'border-app-border bg-app-surface-muted text-app-muted',
    expired: 'border-app-border bg-app-surface-muted text-app-muted',
};

export function PermitRequestStatusBadge({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-1 text-xs font-black uppercase tracking-[0.14em]',
                styles[status] ?? styles.pending,
            )}
        >
            {status.replaceAll('_', ' ')}
        </span>
    );
}
