import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { PollForm } from '@/features/polls/components/poll-form';
import type { PollDefaults } from '@/features/polls/types';
import { create, index } from '@/routes/polls';

export default function CreatePoll({ defaults }: { defaults: PollDefaults }) {
    return (
        <>
            <Head title="Create poll" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                </div>
                <PollForm defaults={defaults} />
            </div>
        </>
    );
}

CreatePoll.layout = {
    breadcrumbs: [
        { title: 'Polls', href: index() },
        { title: 'Create', href: create() },
    ],
};
