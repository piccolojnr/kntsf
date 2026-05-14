import { Badge } from '@/components/ui/badge';

type Visibility = 'public' | 'internal';

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
    return (
        <Badge variant={visibility === 'public' ? 'default' : 'outline'}>
            {visibility === 'public' ? 'Public' : 'Internal'}
        </Badge>
    );
}
