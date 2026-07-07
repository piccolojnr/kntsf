import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
import { EventForm } from '@/features/events/components/event-form';
import type { EventDefaults } from '@/features/events/types';
import { create, index } from '@/routes/events';

export default function CreateEvent({ defaults }: { defaults: EventDefaults }) {
    return (
        <>
            <Head title="Create event" />

            <ContentPage>
                <ContentToolbar>
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
                </ContentToolbar>

                <EventForm defaults={defaults} />
            </ContentPage>
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
