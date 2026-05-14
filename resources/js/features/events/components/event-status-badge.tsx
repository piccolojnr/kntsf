import { PublishStatusBadge } from '@/features/content/components/publish-status-badge';
import type { Event } from '../types';

export function EventStatusBadge({ event }: { event: Event }) {
    return <PublishStatusBadge status={event.status} />;
}
