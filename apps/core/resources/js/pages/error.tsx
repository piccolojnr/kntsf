import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, home } from '@/routes';

const messages: Record<
    number,
    { title: string; description: string; action: string }
> = {
    403: {
        title: 'Access denied',
        description:
            'Your account does not have permission to open this area.',
        action: 'Go to dashboard',
    },
    404: {
        title: 'Page not found',
        description:
            'The page may have moved, been archived, or is not publicly available.',
        action: 'Go home',
    },
    500: {
        title: 'Server error',
        description:
            'Something went wrong while processing the request. Please try again shortly.',
        action: 'Go to dashboard',
    },
    503: {
        title: 'Service unavailable',
        description:
            'The system is temporarily unavailable. Please try again shortly.',
        action: 'Go home',
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const details = messages[status] ?? messages[500];
    const fallbackHref = status === 404 || status === 503 ? home() : dashboard();

    return (
        <>
            <Head title={`${status} ${details.title}`} />
            <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
                <section className="w-full max-w-lg rounded-md border bg-card p-8 shadow-sm">
                    <div className="flex size-12 items-center justify-center rounded-md border bg-muted">
                        <AlertTriangle className="size-6 text-muted-foreground" />
                    </div>
                    <p className="mt-6 text-sm font-medium text-muted-foreground">
                        Error {status}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-normal">
                        {details.title}
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {details.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href={fallbackHref}>
                                <Home className="size-4" />
                                {details.action}
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}

ErrorPage.layout = null;
