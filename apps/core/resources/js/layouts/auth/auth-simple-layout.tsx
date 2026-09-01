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
        <div className="app-page theme-paper min-h-svh text-app-ink">
            <main className="mx-auto grid min-h-svh w-full max-w-6xl gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(24rem,30rem)] lg:items-center lg:px-8 lg:py-8">
                <section className="theme-ink-panel relative hidden min-h-[38rem] overflow-hidden rounded-xl border border-app-border p-7 shadow-[0_18px_50px_rgba(28,24,38,0.14)] lg:flex lg:flex-col lg:justify-between">
                    <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,182,6,0.18),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.12),transparent_24%)]"
                        aria-hidden="true"
                    />
                    <div className="relative">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/12"
                        >
                            <span className="grid size-9 place-items-center overflow-hidden rounded-md bg-white">
                                <AppLogoIcon className="size-full object-cover" />
                            </span>
                            {name}
                        </Link>
                    </div>

                    <div className="relative max-w-2xl">
                        <p className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.2em] text-white/70 uppercase">
                            <ShieldCheck className="size-3.5 text-app-brass" />
                            Admin access
                        </p>
                        <h1 className="mt-6 max-w-xl text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-white">
                            One secure entry point for campus access.
                        </h1>
                        <p className="mt-6 max-w-md text-sm leading-7 text-white/64">
                            Manage notices, elections, permits, records, and
                            student services from the staff dashboard.
                        </p>
                    </div>

                    <div className="relative grid gap-2 sm:grid-cols-3">
                        <AuthSignal icon={<LockKeyhole />} label="Protected" />
                        <AuthSignal icon={<Activity />} label="Audited" />
                        <AuthSignal icon={<ShieldCheck />} label="Verified" />
                    </div>
                </section>

                <section className="flex min-h-[calc(100svh-2.5rem)] items-center justify-center lg:min-h-0">
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
                                    <span className="grid size-9 place-items-center overflow-hidden rounded-md bg-[#1c1826] dark:bg-app-brass">
                                        <AppLogoIcon className="size-full object-cover" />
                                    </span>
                                    <span className="text-sm font-semibold text-app-ink">
                                        {name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="theme-surface-strong overflow-hidden rounded-xl border border-app-border shadow-[0_18px_50px_rgba(28,24,38,0.08)] backdrop-blur-xl dark:shadow-none">
                            <div className="theme-paper-soft border-b border-app-border px-6 py-5 sm:px-7">
                                <p className="text-xs font-semibold tracking-[0.2em] text-app-red uppercase">
                                    Account access
                                </p>
                                <h1 className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.035em] text-app-ink">
                                    {title}
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-app-muted">
                                    {description}
                                </p>
                            </div>

                            <div className="px-6 py-6 sm:px-7">{children}</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function AuthSignal({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="rounded-lg border border-white/12 bg-white/8 p-3 backdrop-blur">
            <span className="grid size-8 place-items-center rounded-md bg-white/10 text-app-brass [&_svg]:size-4">
                {icon}
            </span>
            <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
                {label}
            </p>
        </div>
    );
}
