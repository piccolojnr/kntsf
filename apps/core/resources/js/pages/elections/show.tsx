import { Form, Head, Link } from '@inertiajs/react';
import { Archive, Pencil, Play, Send, StopCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import { ElectionPositionList } from '@/features/elections/components/election-position-list';
import { ElectionResults } from '@/features/elections/components/election-results';
import { ElectionStatusBadge } from '@/features/elections/components/election-status-badge';
import type { Election, ElectionPermissions } from '@/features/elections/types';
import { archive, close, edit, index, publish, start } from '@/routes/elections';

export default function ShowElection({
    election,
    can,
}: {
    election: Election;
    can: ElectionPermissions;
}) {
    return (
        <>
            <Head title={election.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={election.title}
                        description={`${election.academic_period.name} · ${election.academic_period.academic_year}`}
                    />
                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <Button asChild variant="outline">
                                <Link href={edit(election.id)}>
                                    <Pencil />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {can.publish && (
                            <>
                                <ActionButton
                                    form={publish.form(election.id)}
                                    label="Publish"
                                    icon={<Send />}
                                />
                                <ActionButton
                                    form={start.form(election.id)}
                                    label="Start"
                                    icon={<Play />}
                                />
                                <ActionButton
                                    form={close.form(election.id)}
                                    label="Close"
                                    icon={<StopCircle />}
                                />
                                <ActionButton
                                    form={archive.form(election.id)}
                                    label="Archive"
                                    icon={<Archive />}
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
                    <div className="space-y-4">
                        {election.description && (
                            <Card className="gap-0 py-0">
                                <CardHeader className="border-b py-4">
                                    <CardTitle>Election overview</CardTitle>
                                </CardHeader>
                                <CardContent className="py-4">
                                    <RichTextViewer
                                        value={election.description}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <ElectionPositionList election={election} can={can} />
                        <Card>
                            <CardHeader>
                                <CardTitle>Results</CardTitle>
                                <CardDescription>
                                    Results are shown only when permitted.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {can.view_results ? (
                                    <ElectionResults election={election} />
                                ) : (
                                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                        Results are hidden.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <ElectionStatusBadge status={election.status} />
                            <p>{election.votes_count} votes cast</p>
                            <p>{election.positions.length} positions</p>
                            <p>
                                {election.results_visible
                                    ? 'Results visible'
                                    : 'Results hidden'}
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <Link href={index()}>Back to elections</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function ActionButton({
    form,
    label,
    icon,
}: {
    form: { action: string; method: 'post' };
    label: string;
    icon: ReactNode;
}) {
    return (
        <Form {...form} options={{ preserveScroll: true }}>
            {({ processing }) => (
                <Button disabled={processing} variant="outline">
                    {icon}
                    {label}
                </Button>
            )}
        </Form>
    );
}

ShowElection.layout = {
    breadcrumbs: [{ title: 'Elections', href: index() }],
};
