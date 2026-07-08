import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LayoutDashboard, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

export default function DashboardNotFound({ status }: { status: number }) {
    return (
        <>
            <Head title="Dashboard page not found" />
            <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-5xl items-center px-4 py-10 md:px-8">
                <div className="w-full rounded-md border border-app-border bg-card p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="grid size-13 shrink-0 place-items-center rounded-md border bg-muted">
                                <SearchX className="size-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Error {status}
                                </p>
                                <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
                                    Dashboard page not found
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    The dashboard route may have moved under the
                                    new dashboard prefix, or the record may no
                                    longer be available.
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                            <Button asChild>
                                <Link href={dashboard()}>
                                    <LayoutDashboard className="size-4" />
                                    Dashboard
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
                    </div>
                </div>
            </section>
        </>
    );
}
