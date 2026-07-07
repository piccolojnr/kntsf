import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { AnnouncementForm } from '@/features/announcements/components/announcement-form';
import type {
    Announcement,
    AnnouncementDefaults,
} from '@/features/announcements/types';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
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

            <ContentPage>
                <ContentToolbar>
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
                </ContentToolbar>

                <AnnouncementForm
                    announcement={announcement}
                    defaults={defaults}
                />
            </ContentPage>
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
