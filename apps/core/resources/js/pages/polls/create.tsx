import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
import { PollForm } from '@/features/polls/components/poll-form';
import type { PollDefaults } from '@/features/polls/types';
import { create, index } from '@/routes/polls';

export default function CreatePoll({ defaults }: { defaults: PollDefaults }) {
    return (
        <>
            <Head title="Create poll" />
            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Create poll"
                        description="Draft a fixed or dynamic student voting poll."
                    />
                    <Button asChild variant="outline">
                        <Link href={index()}>
                            <ArrowLeft />
                            Back to polls
                        </Link>
                    </Button>
                </ContentToolbar>
                <PollForm defaults={defaults} />
            </ContentPage>
        </>
    );
}

CreatePoll.layout = {
    breadcrumbs: [
        { title: 'Polls', href: index() },
        { title: 'Create', href: create() },
    ],
};
