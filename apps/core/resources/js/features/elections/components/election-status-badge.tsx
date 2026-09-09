import { Badge } from '@/components/ui/badge';
import type { ElectionStatus } from '../types';

export function ElectionStatusBadge({ status }: { status: ElectionStatus }) {
    const variant = status === 'active' ? 'default' : 'secondary';

    return <Badge variant={variant}>{status}</Badge>;
}
