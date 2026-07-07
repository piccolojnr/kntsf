import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { VerificationLogList } from '@/features/verification/components/verification-log-list';
import type { Paginated, VerificationLog } from '@/features/verification/types';
import { index, logs as logsRoute } from '@/routes/verification';

export default function VerificationLogs({
    logs,
}: {
    logs: Paginated<VerificationLog>;
}) {
    return (
        <>
            <Head title="Verification Logs" />

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel relative overflow-hidden p-5 md:p-6">
                    <div className="absolute right-6 bottom-6 size-24 rounded-full border border-dashed border-app-border opacity-70" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading
                            title="Verification logs"
                            description="Review manual verification attempts without exposing submitted identifiers."
                        />

                        <Button asChild variant="outline">
                            <Link href={index()}>
                                <ArrowLeft />
                                Verification
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="app-panel gap-0 overflow-hidden py-0">
                    <CardHeader className="py-4">
                        <CardTitle>Recent attempts</CardTitle>
                        <CardDescription>
                            Raw student numbers and permit codes are not
                            displayed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="border-t border-app-border py-4">
                        <VerificationLogList logs={logs} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

VerificationLogs.layout = {
    breadcrumbs: [
        {
            title: 'Verification',
            href: index(),
        },
        {
            title: 'Logs',
            href: logsRoute(),
        },
    ],
};
