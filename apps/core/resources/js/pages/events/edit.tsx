import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading title="Edit event" description={event.title} />

                    <Button asChild variant="outline">
                        <Link href={show(event.id)}>
                            <ArrowLeft />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <EventForm event={event} defaults={defaults} />
            </div>
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
