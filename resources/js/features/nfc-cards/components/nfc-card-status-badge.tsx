import { Badge } from '@/components/ui/badge';
import type { NfcCard } from '../types';

export function NfcCardStatusBadge({ card }: { card: NfcCard }) {
    const className = {
        active: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
        inactive:
            'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300',
        revoked:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
        lost: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
        stolen: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
        replaced:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300',
        damaged:
            'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300',
    }[card.status];

    return (
        <Badge variant="outline" className={`rounded-md px-2 py-1 ${className}`}>
            {card.status_label}
        </Badge>
    );
}
