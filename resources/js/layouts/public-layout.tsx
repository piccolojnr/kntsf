import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ChevronRight, LogIn, Menu, X } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { dashboard, home, login } from '@/routes';
import { index as announcementsIndex } from '@/routes/public/announcements';
import { index as documentsIndex } from '@/routes/public/documents';
import { index as electionsIndex } from '@/routes/public/elections';
import { index as eventsIndex } from '@/routes/public/events';
import { index as executivesIndex } from '@/routes/public/executives';
import type { SharedPageProps } from '@/types';

const navItems = [
    { label: 'Announcements', href: announcementsIndex() },
    { label: 'Events', href: eventsIndex() },
    { label: 'Documents', href: documentsIndex() },
    { label: 'Executives', href: executivesIndex() },
    { label: 'Elections', href: electionsIndex() },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedPageProps>().props;
    const currentUrl = usePage().url;

    function isActive(href: string) {
        return currentUrl.startsWith(href);
    }

    const ctaHref = auth.user ? dashboard() : login();
    const ctaLabel = auth.user ? 'Dashboard' : 'Staff Login';

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* ── Masthead header ────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-background shadow-sm">
                {/* Top bar: logo + CTA */}
                <div className="border-b">
                    <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-6">
                        {/* Logo */}
                        <Link href={home()} className="flex shrink-0 items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                                <BookOpen className="size-3.5" />
                            </div>
                            <div className="leading-tight">
                                <span className="block text-sm font-bold tracking-tight">Knutsford SRC</span>
                                <span className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                    Student Representative Council
                                </span>
                            </div>
                        </Link>

                        {/* Desktop CTA */}
                        <Link
                            href={ctaHref}
                            className="hidden items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted md:flex"
                        >
                            <LogIn className="size-3.5" />
                            {ctaLabel}
                        </Link>

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            className="flex size-9 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
                            onClick={() => setOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {open ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>

                {/* Nav strip — desktop only */}
                <div className="hidden border-b bg-muted/30 md:block">
                    <div className="mx-auto flex w-full max-w-6xl items-center gap-1 px-4 md:px-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`relative px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                    isActive(item.href)
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {item.label}
                                {isActive(item.href) && (
                                    <span className="absolute inset-x-3 bottom-0 h-0.5 bg-primary" />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile drawer */}
                {open && (
                    <div className="border-b bg-background md:hidden">
                        <nav className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center rounded px-3 py-3 text-sm font-medium transition-colors ${
                                        isActive(item.href)
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                    onClick={() => setOpen(false)}
                                >
                                    {isActive(item.href) && (
                                        <span className="mr-2.5 inline-block size-1.5 rounded-full bg-primary" />
                                    )}
                                    {item.label}
                                </Link>
                            ))}
                            <div className="my-1 border-t" />
                            <Link
                                href={ctaHref}
                                className="flex items-center justify-between rounded px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                                onClick={() => setOpen(false)}
                            >
                                {ctaLabel}
                                <ChevronRight className="size-4" />
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* Page content */}
            <main>{children}</main>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <footer className="mt-16 border-t bg-muted/20">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[1fr_auto_auto]">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                                    <BookOpen className="size-3" />
                                </div>
                                <p className="text-sm font-bold">Knutsford SRC</p>
                            </div>
                            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                                The Student Representative Council public information portal. Official news, events, and leadership updates.
                            </p>
                        </div>

                        {/* Quick links */}
                        <div>
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                Portal
                            </p>
                            <ul className="space-y-2">
                                {navItems.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Account */}
                        <div>
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                Access
                            </p>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href={ctaHref}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {ctaLabel}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-5 text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Knutsford University — Student Representative Council.
                    </div>
                </div>
            </footer>
        </div>
    );
}
