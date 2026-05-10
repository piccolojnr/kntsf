import { Badge } from '@/components/ui/badge';
import type { Executive } from '../types';

export function ExecutiveStatusBadge({ executive }: { executive: Executive }) {
    return (
        <Badge variant={executive.is_active ? 'secondary' : 'destructive'}>
            {executive.is_active ? 'Active' : 'Inactive'}
        </Badge>
    );
}
