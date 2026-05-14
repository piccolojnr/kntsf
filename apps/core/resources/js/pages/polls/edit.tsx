import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
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
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading title="Edit poll" description={poll.title} />
                    <Button asChild variant="outline">
                        <Link href={show(poll.id)}>
                            <ArrowLeft />
                            Back to details
                        </Link>
                    </Button>
                </div>
                <PollForm poll={poll} defaults={defaults} />
            </div>
        </>
    );
}

EditPoll.layout = {
    breadcrumbs: [
        { title: 'Polls', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
