import { Badge } from '@/components/ui/badge';

export function AnnouncementFeaturedBadge({
    isFeatured,
}: {
    isFeatured: boolean;
}) {
    if (!isFeatured) {
        return null;
    }

    return <Badge variant="secondary">Featured</Badge>;
}
