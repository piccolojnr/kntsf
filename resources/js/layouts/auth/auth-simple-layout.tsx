import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="app-page flex min-h-svh items-center justify-center p-4 sm:p-6">
            <main className="flex w-full max-w-md flex-col gap-5">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-2 font-medium"
                    >
                        <div className="flex size-12 items-center justify-center rounded-md border border-app-border bg-app-surface shadow-sm">
                            <AppLogoIcon className="size-9 rounded-md object-cover" />
                        </div>
                        <span className="sr-only">Knutsford SRC</span>
                    </Link>
                </div>

                <section className="app-panel overflow-hidden">
                    <div className="border-b border-app-border px-6 py-6 text-center sm:px-8">
                        <div className="space-y-2">
                            <h1 className="text-xl leading-tight font-semibold tracking-tight text-app-ink">
                                {title}
                            </h1>
                            <p className="text-sm leading-6 text-app-muted">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-6 sm:px-8">{children}</div>
                </section>
            </main>
        </div>
    );
}
