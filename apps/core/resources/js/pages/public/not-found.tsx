import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export default function PublicNotFound({ status }: { status: number }) {
    return (
        <>
            <Head title="Page not found" />
            <section className="relative min-h-[72vh] overflow-hidden px-5 pt-34 pb-18 md:px-8 md:pt-38">
                <div
                    className="public-notebook-grid pointer-events-none absolute inset-0 opacity-45"
                    aria-hidden="true"
                />
                <div className="relative mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
                    <div className="flex aspect-square max-w-72 items-center justify-center rounded-full border border-app-border bg-app-surface shadow-[0_24px_70px_rgba(12,10,18,0.08)]">
                        <SearchX className="size-20 text-app-red" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold tracking-[0.2em] text-app-muted uppercase">
                            Error {status}
                        </p>
                        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-normal text-app-ink md:text-6xl">
                            This public page could not be found.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-app-muted md:text-lg">
                            The link may have changed, the item may no longer
                            be published, or the page may not be available on
                            the public portal.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild className="theme-primary-action">
                                <Link href={home()}>
                                    <Home className="size-4" />
                                    Public home
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
