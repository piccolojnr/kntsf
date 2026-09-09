import { PublishStatusBadge } from '@/features/content/components/publish-status-badge';
import type { Poll } from '../types';

export function PollStatusBadge({ poll }: { poll: Poll }) {
    return <PublishStatusBadge status={poll.status} />;
}
