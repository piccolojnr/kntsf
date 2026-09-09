import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/badge';

type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';

const statusLabels: Record<PublishStatus, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    published: 'Published',
    archived: 'Archived',
};

const statusVariants: Record<
    PublishStatus,
    ComponentProps<typeof Badge>['variant']
> = {
    draft: 'outline',
    scheduled: 'secondary',
    published: 'default',
    archived: 'destructive',
};

export function PublishStatusBadge({ status }: { status: PublishStatus }) {
    return (
        <Badge variant={statusVariants[status]}>
            {statusLabels[status]}
        </Badge>
    );
}
