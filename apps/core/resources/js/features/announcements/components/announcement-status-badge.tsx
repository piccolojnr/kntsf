import { PublishStatusBadge } from '@/features/content/components/publish-status-badge';
import type { Announcement } from '../types';

export function AnnouncementStatusBadge({
    announcement,
}: {
    announcement: Announcement;
}) {
    return <PublishStatusBadge status={announcement.status} />;
}
