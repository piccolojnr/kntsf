import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { AnnouncementForm } from '@/features/announcements/components/announcement-form';
import type { AnnouncementDefaults } from '@/features/announcements/types';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
import { create, index } from '@/routes/announcements';

export default function CreateAnnouncement({
    defaults,
}: {
    defaults: AnnouncementDefaults;
}) {
    return (
        <>
            <Head title="Create announcement" />

            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Create announcement"
                        description="Draft or publish an SRC communication post."
                    />

                    <Button asChild variant="outline">
                        <Link href={index()}>
                            <ArrowLeft />
                            Back to announcements
                        </Link>
                    </Button>
                </ContentToolbar>

                <AnnouncementForm defaults={defaults} />
            </ContentPage>
        </>
    );
}

CreateAnnouncement.layout = {
    breadcrumbs: [
        {
            title: 'Announcements',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
