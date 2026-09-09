import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
import { EventForm } from '@/features/events/components/event-form';
import type { Event, EventDefaults } from '@/features/events/types';
import { edit, index, show } from '@/routes/events';

export default function EditEvent({
    event,
    defaults,
}: {
    event: Event;
    defaults: EventDefaults;
}) {
    return (
        <>
            <Head title={`Edit ${event.title}`} />

            <ContentPage>
                <ContentToolbar>
                    <Heading title="Edit event" description={event.title} />

                    <Button asChild variant="outline">
                        <Link href={show(event.id)}>
                            <ArrowLeft />
                            Back to details
                        </Link>
                    </Button>
                </ContentToolbar>

                <EventForm event={event} defaults={defaults} />
            </ContentPage>
        </>
    );
}

EditEvent.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: index(),
        },
        {
            title: 'Edit',
            href: edit(0),
        },
    ],
};
