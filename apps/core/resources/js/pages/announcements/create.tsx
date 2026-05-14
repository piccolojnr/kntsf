import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { AnnouncementForm } from '@/features/announcements/components/announcement-form';
import type { AnnouncementDefaults } from '@/features/announcements/types';
import { create, index } from '@/routes/announcements';

export default function CreateAnnouncement({
    defaults,
}: {
    defaults: AnnouncementDefaults;
}) {
    return (
        <>
            <Head title="Create announcement" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                </div>

                <AnnouncementForm defaults={defaults} />
            </div>
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
