import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    ContentPage,
    ContentToolbar,
} from '@/features/content/components/content-admin-surface';
import { PollForm } from '@/features/polls/components/poll-form';
import type { Poll, PollDefaults } from '@/features/polls/types';
import { edit, index, show } from '@/routes/polls';

export default function EditPoll({
    poll,
    defaults,
}: {
    poll: Poll;
    defaults: PollDefaults;
}) {
    return (
        <>
            <Head title={`Edit ${poll.title}`} />
            <ContentPage>
                <ContentToolbar>
                    <Heading title="Edit poll" description={poll.title} />
                    <Button asChild variant="outline">
                        <Link href={show(poll.id)}>
                            <ArrowLeft />
                            Back to details
                        </Link>
                    </Button>
                </ContentToolbar>
                <PollForm poll={poll} defaults={defaults} />
            </ContentPage>
        </>
    );
}

EditPoll.layout = {
    breadcrumbs: [
        { title: 'Polls', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
