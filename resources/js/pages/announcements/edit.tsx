import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { AnnouncementForm } from '@/features/announcements/components/announcement-form';
import type {
    Announcement,
    AnnouncementDefaults,
} from '@/features/announcements/types';
import { edit, index, show } from '@/routes/announcements';

export default function EditAnnouncement({
    announcement,
    defaults,
}: {
    announcement: Announcement;
    defaults: AnnouncementDefaults;
}) {
    return (
        <>
            <Head title={`Edit ${announcement.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Edit announcement"
                        description={announcement.title}
                    />

                    <Button asChild variant="outline">
                        <Link href={show(announcement.id)}>
                            <ArrowLeft />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <AnnouncementForm
                    announcement={announcement}
                    defaults={defaults}
                />
            </div>
        </>
    );
}

EditAnnouncement.layout = {
    breadcrumbs: [
        {
            title: 'Announcements',
            href: index(),
        },
        {
            title: 'Edit',
            href: edit(0),
        },
    ],
};
