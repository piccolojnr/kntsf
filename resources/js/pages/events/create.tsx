import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { EventForm } from '@/features/events/components/event-form';
import type { EventDefaults } from '@/features/events/types';
import { create, index } from '@/routes/events';

export default function CreateEvent({ defaults }: { defaults: EventDefaults }) {
    return (
        <>
            <Head title="Create event" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Create event"
                        description="Draft or publish an SRC event."
                    />

                    <Button asChild variant="outline">
                        <Link href={index()}>
                            <ArrowLeft />
                            Back to events
                        </Link>
                    </Button>
                </div>

                <EventForm defaults={defaults} />
            </div>
        </>
    );
}

CreateEvent.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
