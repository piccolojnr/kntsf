import { PublishStatusBadge } from '@/features/content/components/publish-status-badge';
import type { Document } from '../types';

export function DocumentStatusBadge({ document }: { document: Document }) {
    return <PublishStatusBadge status={document.status} />;
}
