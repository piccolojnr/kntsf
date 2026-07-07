import { Link, usePage } from '@inertiajs/react';
import { Activity, ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import AppLogoIcon from '@/components/app/app-logo-icon';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { home } from '@/routes';
import type { AuthLayoutProps, SharedPageProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage<SharedPageProps>().props;

    return (
        <div className="app-page theme-paper relative min-h-svh overflow-hidden text-app-ink">
            <div
                className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                aria-hidden="true"
            />
            <div
                className="absolute top-[-8rem] right-[-7rem] size-80 rounded-full border border-app-border/80 bg-app-brass/10 blur-sm"
                aria-hidden="true"
            />
            <div
                className="absolute bottom-[-9rem] left-[-7rem] size-72 rounded-full border border-app-border/80 bg-[#1c1826]/5 dark:bg-white/5"
                aria-hidden="true"
            />

            <main className="relative mx-auto grid min-h-svh w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(25rem,31rem)] lg:items-stretch lg:px-8 lg:py-8">
                <section className="theme-ink-panel relative hidden overflow-hidden rounded-[1.5rem] border border-app-border p-8 shadow-[0_24px_80px_rgba(28,24,38,0.18)] lg:flex lg:flex-col lg:justify-between">
                    <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,182,6,0.18),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.12),transparent_24%)]"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute right-8 bottom-10 h-44 w-44 rounded-full border border-dashed border-white/18"
                        aria-hidden="true"
                    />

                    <div className="relative">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/12"
                        >
                            <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-white">
                                <AppLogoIcon className="size-full object-cover" />
                            </span>
                            {name}
                        </Link>
                    </div>

                    <div className="relative max-w-2xl">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.2em] text-white/70 uppercase">
                            <ShieldCheck className="size-3.5 text-app-brass" />
                            Admin access
                        </p>
                        <h1 className="mt-7 max-w-xl text-5xl leading-[0.96] font-semibold tracking-[-0.055em] text-white">
                            Secure desk for campus operations.
                        </h1>
                        <p className="mt-6 max-w-md text-sm leading-7 text-white/64">
                            Manage notices, elections, permits, records, and
                            student services from the staff dashboard.
                        </p>
                    </div>

                    <div className="relative grid gap-3 sm:grid-cols-3">
                        <AuthSignal icon={<LockKeyhole />} label="Protected" />
                        <AuthSignal icon={<Activity />} label="Audited" />
                        <AuthSignal icon={<ShieldCheck />} label="Verified" />
                    </div>
                </section>

                <section className="flex min-h-[calc(100svh-2.5rem)] items-center justify-center lg:min-h-full">
                    <div className="w-full max-w-md">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <Link
                                href={home()}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-app-muted transition hover:text-app-red"
                            >
                                <ArrowLeft className="size-4" />
                                Public portal
                            </Link>
                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <div className="hidden items-center gap-2 sm:flex lg:hidden">
                                    <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-[#1c1826] dark:bg-app-brass">
                                        <AppLogoIcon className="size-full object-cover" />
                                    </span>
                                    <span className="text-sm font-semibold text-app-ink">
                                        {name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="theme-surface-strong overflow-hidden rounded-[1.35rem] border border-app-border shadow-[0_22px_70px_rgba(28,24,38,0.09)] backdrop-blur-xl dark:shadow-none">
                            <div className="theme-paper-soft border-b border-app-border px-6 py-6 sm:px-8">
                                <p className="text-xs font-semibold tracking-[0.2em] text-app-red uppercase">
                                    Staff dashboard
                                </p>
                                <h1 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.035em] text-app-ink">
                                    {title}
                                </h1>
                                <p className="mt-3 text-sm leading-6 text-app-muted">
                                    {description}
                                </p>
                            </div>

                            <div className="px-6 py-6 sm:px-8">{children}</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function AuthSignal({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="rounded-[1rem] border border-white/12 bg-white/8 p-4 backdrop-blur">
            <span className="grid size-9 place-items-center rounded-full bg-white/10 text-app-brass [&_svg]:size-4">
                {icon}
            </span>
            <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
                {label}
            </p>
        </div>
    );
}
