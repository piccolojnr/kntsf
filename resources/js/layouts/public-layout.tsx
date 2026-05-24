import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    GraduationCap,
    Menu,
    ShieldCheck,
    X,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app/app-logo-icon';
import { home } from '@/routes';
import { index as announcementsIndex } from '@/routes/public/announcements';
import { index as documentsIndex } from '@/routes/public/documents';
import { index as electionsIndex } from '@/routes/public/elections';
import { index as eventsIndex } from '@/routes/public/events';
import { index as executivesIndex } from '@/routes/public/executives';
import { index as permitRequestIndex } from '@/routes/public/permit-request';

const navItems = [
    {
        label: 'Announcements',
        href: announcementsIndex(),
        url: announcementsIndex.url(),
    },
    { label: 'Events', href: eventsIndex(), url: eventsIndex.url() },
    { label: 'Documents', href: documentsIndex(), url: documentsIndex.url() },
    { label: 'Executives', href: executivesIndex(), url: executivesIndex.url() },
    { label: 'Elections', href: electionsIndex(), url: electionsIndex.url() },
    {
        label: 'Permit Request',
        href: permitRequestIndex(),
        url: permitRequestIndex.url(),
    },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const currentUrl = usePage().url;

    function isActive(href: string) {
        return currentUrl === href || currentUrl.startsWith(`${href}/`);
    }

    return (
        <div className="public-page">
            {/* Ambient gradient blobs */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -top-40 -right-32 size-[48rem] rounded-full bg-app-teal/5 blur-3xl dark:bg-app-teal/8" />
                <div className="absolute top-1/3 -left-40 size-[36rem] rounded-full bg-app-red/4 blur-3xl dark:bg-app-red/6" />
                <div className="absolute -bottom-20 right-1/4 size-[40rem] rounded-full bg-app-brass/5 blur-3xl dark:bg-app-brass/6" />
            </div>

            {/* Subtle dot texture */}
            <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] [background-image:radial-gradient(#17211b_1px,transparent_1px)] [background-size:20px_20px] dark:opacity-[0.045] dark:[background-image:radial-gradient(#f5ead2_1px,transparent_1px)]" />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-app-border/25 bg-white/75 backdrop-blur-xl dark:bg-app-page/80">
                <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-5 md:px-8">
                    {/* Brand */}
                    <Link href={home()} className="group flex items-center gap-3">
                        <div className="grid size-10 place-items-center overflow-hidden rounded-2xl border border-app-border/40 bg-white shadow-md shadow-app-teal/10 transition duration-300 group-hover:scale-105 group-hover:shadow-app-teal/20 dark:border-app-border/20 dark:bg-app-surface">
                            <AppLogoIcon className="size-full object-cover" />
                        </div>
                        <div className="leading-tight">
                            <span className="block text-[15px] font-extrabold tracking-tight text-app-ink">
                                Knutsford SRC
                            </span>
                            <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-app-teal dark:text-app-brass">
                                Public portal
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                    isActive(item.url)
                                        ? 'bg-app-teal/10 text-app-teal dark:bg-app-brass/10 dark:text-app-brass'
                                        : 'text-app-muted hover:bg-app-surface-muted/60 hover:text-app-ink dark:hover:bg-app-surface/30'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="hidden items-center gap-3 md:flex">
                        <div className="hidden items-center gap-2 rounded-full border border-app-border/40 bg-app-surface-muted/50 px-3.5 py-2 text-xs font-semibold text-app-muted xl:flex">
                            <ShieldCheck className="size-3.5 text-app-teal dark:text-app-brass" />
                            Official SRC information
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="grid size-10 place-items-center rounded-2xl border border-app-border/35 bg-white/80 text-app-ink shadow-sm backdrop-blur-sm transition hover:bg-app-surface-muted/60 md:hidden dark:border-app-border/25 dark:bg-app-surface/60"
                        onClick={() => setOpen((value) => !value)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
                    </button>
                </div>

                {/* Mobile Menu Drawer */}
                {open && (
                    <div className="border-t border-app-border/20 bg-white/90 px-5 py-4 backdrop-blur-xl md:hidden dark:bg-app-page/90">
                        <nav className="grid gap-1.5">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                                        isActive(item.url)
                                            ? 'bg-app-teal/10 text-app-teal dark:bg-app-brass/10 dark:text-app-brass'
                                            : 'text-app-ink hover:bg-app-surface-muted/60'
                                    }`}
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                    <ChevronRight className="size-4 opacity-40" />
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <main className="relative z-10">{children}</main>

            {/* Footer */}
            <footer className="relative z-10 mt-24 border-t border-app-border/25 bg-white/60 backdrop-blur-xl dark:bg-app-surface/40">
                <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-14 md:grid-cols-[1fr_auto_auto] md:px-8">
                    {/* Brand column */}
                    <div className="max-w-sm">
                        <Link href={home()} className="group inline-flex items-center gap-3">
                            <div className="grid size-10 place-items-center overflow-hidden rounded-2xl border border-app-border/40 bg-white shadow-md shadow-app-teal/8 transition duration-300 group-hover:scale-105 dark:border-app-border/20 dark:bg-app-surface">
                                <AppLogoIcon className="size-full object-cover" />
                            </div>
                            <div className="leading-tight">
                                <p className="text-[15px] font-extrabold tracking-tight text-app-ink">
                                    Knutsford SRC
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-app-teal dark:text-app-brass">
                                    Student Representative Council
                                </p>
                            </div>
                        </Link>
                        <p className="mt-5 text-sm leading-relaxed text-app-muted">
                            Official announcements, events, documents, leadership
                            profiles, and election information from the Student
                            Representative Council.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-app-border/30 bg-app-surface-muted/50 px-3.5 py-2 text-xs font-semibold text-app-muted">
                            <GraduationCap className="size-3.5 text-app-teal dark:text-app-brass" />
                            Knutsford University College
                        </div>
                    </div>

                    {/* Portal links column */}
                    <div>
                        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-app-teal dark:text-app-brass">
                            Portal
                        </p>
                        <ul className="grid gap-3">
                            {navItems.slice(0, 3).map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-sm font-medium text-app-muted transition-colors duration-200 hover:text-app-ink dark:hover:text-app-surface"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* More links column */}
                    <div>
                        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-app-teal dark:text-app-brass">
                            More
                        </p>
                        <ul className="grid gap-3">
                            {navItems.slice(3).map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-sm font-medium text-app-muted transition-colors duration-200 hover:text-app-ink dark:hover:text-app-surface"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-app-border/20 px-5 py-5 text-center text-xs font-medium text-app-muted/70">
                    © {new Date().getFullYear()} Knutsford University SRC. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
