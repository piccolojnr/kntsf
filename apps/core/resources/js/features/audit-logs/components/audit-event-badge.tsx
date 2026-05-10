import { Badge } from '@/components/ui/badge';

const eventTone: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'permit.revoked': 'destructive',
    'payment.failed': 'destructive',
    'payment.cancelled': 'destructive',
    'nfc.lost': 'destructive',
    'nfc.revoked': 'destructive',
    'verification.performed': 'outline',
};

export function AuditEventBadge({
    event,
    label,
}: {
    event: string;
    label?: string;
}) {
    return (
        <Badge variant={eventTone[event] ?? 'secondary'}>
            {label ?? event.replaceAll('.', ' ')}
        </Badge>
    );
}
