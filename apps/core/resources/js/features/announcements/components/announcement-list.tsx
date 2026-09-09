import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, edit, show } from '@/routes/announcements';
import type {
    Announcement,
    AnnouncementPermissions,
    Paginated,
} from '../types';
import { AnnouncementFeaturedBadge } from './announcement-featured-badge';
import { AnnouncementStatusBadge } from './announcement-status-badge';

export function AnnouncementList({
    announcements,
    can,
}: {
    announcements: Paginated<Announcement>;
    can: AnnouncementPermissions;
}) {
    if (announcements.data.length === 0) {
        return (
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No announcements found
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Create an announcement or adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[1rem] border border-app-border bg-app-surface">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Announcement
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Visibility
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Author
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Published
                            </th>
                            <th className="px-4 py-3 text-right font-semibold tracking-[0.12em] uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {announcements.data.map((announcement) => (
                            <tr
                                key={announcement.id}
                                className="transition duration-200 hover:bg-app-surface-muted"
                            >
                                <td className="px-4 py-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-app-ink">
                                                {announcement.title}
                                            </p>
                                            <AnnouncementFeaturedBadge
                                                isFeatured={
                                                    announcement.is_featured
                                                }
                                            />
                                        </div>
                                        <p className="max-w-md truncate text-xs text-app-muted">
                                            {announcement.excerpt ??
                                                announcement.slug}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <AnnouncementStatusBadge
                                        announcement={announcement}
                                    />
                                </td>
                                <td className="px-4 py-3 text-app-ink capitalize">
                                    {announcement.visibility}
                                </td>
                                <td className="px-4 py-3 text-app-ink">
                                    {announcement.author.name}
                                </td>
                                <td className="px-4 py-3 text-app-muted">
                                    {formatDate(announcement.published_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link href={show(announcement.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>
                                        {can.update && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={edit(announcement.id)}
                                                >
                                                    <Pencil />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <ConfirmActionDialog
                                                form={destroy.form(
                                                    announcement.id,
                                                )}
                                                title="Delete announcement?"
                                                description={`This will remove "${announcement.title}" from normal announcement records.`}
                                                confirmLabel="Delete announcement"
                                                trigger={
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                }
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleDateString();
}
