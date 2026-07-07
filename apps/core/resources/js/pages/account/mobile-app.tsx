import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, LogOut, Smartphone } from 'lucide-react';
import AppLogoIcon from '@/components/app/app-logo-icon';
import { Button } from '@/components/ui/button';
import { home, logout } from '@/routes';
import type { SharedPageProps } from '@/types';

export default function MobileAppAccountReady() {
    const { auth, status } = usePage<SharedPageProps & { status?: string }>()
        .props;

    return (
        <main className="theme-paper min-h-screen text-app-ink">
            <Head title="Student account ready" />

            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8">
                <Link href={home()} className="flex w-fit items-center gap-3">
                    <div className="grid size-11 place-items-center overflow-hidden rounded-md border border-app-ink bg-app-ink text-app-surface shadow-[5px_5px_0_var(--app-brass)] dark:border-app-surface dark:bg-app-surface dark:text-app-ink">
                        <AppLogoIcon className="size-full object-cover" />
                    </div>
                    <div className="leading-tight">
                        <span className="block text-base font-black">
                            Knutsford SRC
                        </span>
                        <span className="block text-[10px] font-black tracking-[0.24em] text-app-red uppercase">
                            Student mobile access
                        </span>
                    </div>
                </Link>

                <section className="grid flex-1 place-items-center py-16">
                    <div className="app-panel w-full max-w-2xl p-6 md:p-10">
                        <div className="mb-8 flex items-start gap-4">
                            <div className="grid size-14 shrink-0 place-items-center rounded-md bg-app-teal text-white dark:bg-app-brass dark:text-app-ink">
                                <CheckCircle2 className="size-7" />
                            </div>
                            <div>
                                <p className="text-xs font-black tracking-[0.22em] text-app-red uppercase">
                                    Account ready
                                </p>
                                <h1 className="mt-2 text-3xl font-black tracking-normal md:text-5xl">
                                    Continue in the mobile app
                                </h1>
                            </div>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-md border border-app-teal/30 bg-app-teal/10 px-4 py-3 text-sm font-semibold text-app-teal dark:border-app-brass/40 dark:bg-app-brass/10 dark:text-app-brass">
                                {status}
                            </div>
                        )}

                        <p className="text-base leading-7 text-app-muted">
                            Student accounts are managed through the Knutsford
                            SRC mobile app. Use the email and password you just
                            created to sign in and access permits, NFC card
                            status, announcements, elections, polls, and SRC
                            updates.
                        </p>

                        <div className="app-panel-muted mt-8 grid gap-3 p-4 text-sm text-app-muted">
                            <div className="flex items-center gap-3 font-semibold text-app-ink">
                                <Smartphone className="size-5 text-app-red" />
                                Open the Knutsford SRC app on your phone.
                            </div>
                            <p>
                                If the app is not installed yet, install it from
                                the official download link provided by the SRC,
                                then log in with this account.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                className="theme-primary-action h-11"
                            >
                                <Link href={home()}>
                                    Return to public portal
                                </Link>
                            </Button>

                            {auth.user && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11"
                                >
                                    <Link
                                        href={logout()}
                                        method="post"
                                        as="button"
                                    >
                                        <LogOut className="size-4" />
                                        Sign out
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
