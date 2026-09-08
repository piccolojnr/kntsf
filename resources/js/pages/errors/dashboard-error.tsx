import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

const messages: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Access denied',
        description:
            'Your account does not have permission to open this dashboard area.',
    },
    404: {
        title: 'Dashboard page not found',
        description:
            'This dashboard page may have moved or no longer be available.',
    },
    500: {
        title: 'Dashboard error',
        description:
            'Something went wrong while processing this request. Please try again shortly.',
    },
    503: {
        title: 'Dashboard unavailable',
        description:
            'The dashboard is temporarily unavailable. Please try again shortly.',
    },
};

export default function DashboardError({ status }: { status: number }) {
    const details = messages[status] ?? messages[500];

    return (
        <>
            <Head title={`${status} ${details.title}`} />
            <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-5xl items-center px-4 py-10 md:px-8">
                <div className="w-full rounded-md border border-app-border bg-card p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="grid size-13 shrink-0 place-items-center rounded-md border bg-muted">
                                <ShieldAlert className="size-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Error {status}
                                </p>
                                <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
                                    {details.title}
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {details.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            <Button asChild>
                                <Link href={dashboard()}>
                                    <LayoutDashboard className="size-4" />{' '}
                                    Dashboard
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="size-4" /> Back
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
