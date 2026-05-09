import { Badge } from '@/components/ui/badge';
import type { Permit } from '../types';

export function PermitStatusBadge({ permit }: { permit: Permit }) {
    const className = {
        active: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
        expired: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300',
        revoked:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
    }[permit.status];

    return (
        <Badge variant="outline" className={`rounded-md px-2 py-1 ${className}`}>
            {permit.status_label}
        </Badge>
    );
}
