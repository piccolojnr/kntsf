import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, ChevronRight, Menu, ShieldCheck, X } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
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
    {
        label: 'Executives',
        href: executivesIndex(),
        url: executivesIndex.url(),
    },
    { label: 'Elections', href: electionsIndex(), url: electionsIndex.url() },
    {
        label: 'Permit Request',
        href: permitRequestIndex(),
        url: permitRequestIndex.url(),
    },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const currentUrl = usePage().url;
    const currentPath = currentUrl.split('?')[0];
    const isHome = currentPath === '/';
    const imageBackedHeaderPaths = [
        announcementsIndex.url(),
        documentsIndex.url(),
        electionsIndex.url(),
        eventsIndex.url(),
        executivesIndex.url(),
    ];
    const hasImageBackedHeader =
        isHome || imageBackedHeaderPaths.includes(currentPath);
    const transparentHeader = hasImageBackedHeader && !scrolled && !open;

    useEffect(() => {
        function updateScrolledState() {
            setScrolled(window.scrollY > 36);
        }

        updateScrolledState();
        window.addEventListener('scroll', updateScrolledState, {
            passive: true,
        });

        return () => window.removeEventListener('scroll', updateScrolledState);
    }, []);

    function isActive(href: string) {
        return currentUrl === href || currentUrl.startsWith(`${href}/`);
    }

    return (
        <div className="public-page relative overflow-x-hidden bg-[#f8f7f3] text-app-ink dark:bg-app-page">
            <header
                className={`top-0 z-40 w-full px-3 py-3 text-app-ink transition-all duration-300 ${
                    hasImageBackedHeader ? 'fixed' : 'sticky'
                } ${transparentHeader ? 'text-white' : 'text-app-ink'}`}
            >
                <div
                    className={`mx-auto flex h-15 w-full max-w-7xl items-center justify-between rounded-full border px-3 shadow-[0_18px_60px_rgba(12,10,18,0.08)] transition-all duration-300 md:px-4 ${
                        transparentHeader
                            ? 'border-white/16 bg-white/[0.07] shadow-none backdrop-blur-[2px]'
                            : 'border-app-border/80 bg-[#f8f7f3]/92 backdrop-blur-xl dark:bg-app-page/92'
                    }`}
                >
                    <Link
                        href={home()}
                        className="group flex min-w-0 items-center gap-3"
                    >
                        <span
                            className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-full transition duration-300 group-hover:scale-95 ${
                                transparentHeader
                                    ? 'bg-white/14 ring-1 ring-white/18'
                                    : 'bg-app-ink ring-1 ring-app-border dark:bg-app-surface'
                            }`}
                        >
                            <AppLogoIcon className="size-full object-cover" />
                        </span>
                        <span className="min-w-0 leading-tight">
                            <span
                                className={`block truncate text-sm font-semibold tracking-tight ${
                                    transparentHeader
                                        ? 'text-white'
                                        : 'text-app-ink'
                                }`}
                            >
                                Knutsford SRC
                            </span>
                            <span
                                className={`block text-[0.68rem] font-medium tracking-[0.18em] uppercase ${
                                    transparentHeader
                                        ? 'text-white/62'
                                        : 'text-app-muted'
                                }`}
                            >
                                Public portal
                            </span>
                        </span>
                    </Link>

                    <nav
                        className={`hidden items-center gap-1 rounded-full border p-1 lg:flex ${
                            transparentHeader
                                ? 'border-white/12 bg-black/10'
                                : 'border-app-border bg-white/60 dark:bg-app-surface/60'
                        }`}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition duration-200 ${
                                    transparentHeader
                                        ? isActive(item.url)
                                            ? 'bg-white text-app-ink'
                                            : 'text-white/72 hover:bg-white/10 hover:text-white'
                                        : isActive(item.url)
                                          ? 'bg-app-ink text-white'
                                          : 'text-app-muted hover:bg-app-ink/5 hover:text-app-ink'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <Link
                        href={permitRequestIndex()}
                        className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition duration-200 md:flex ${
                            transparentHeader
                                ? 'border-white/18 bg-white text-app-ink hover:bg-white/88'
                                : 'border-app-ink bg-app-ink text-white hover:border-app-red hover:bg-app-red'
                        }`}
                    >
                        <ShieldCheck
                            className={`size-3.5 ${
                                transparentHeader
                                    ? 'text-app-red'
                                    : 'text-white'
                            }`}
                        />
                        Permit
                    </Link>

                    <button
                        type="button"
                        className={`grid size-10 place-items-center rounded-full border transition md:hidden ${
                            transparentHeader
                                ? 'border-white/18 bg-white/10 text-white hover:bg-white/15'
                                : 'border-app-border bg-white/70 text-app-ink hover:bg-app-surface-muted dark:bg-app-surface'
                        }`}
                        onClick={() => setOpen((value) => !value)}
                        aria-label="Toggle menu"
                    >
                        {open ? (
                            <X className="size-4" />
                        ) : (
                            <Menu className="size-4" />
                        )}
                    </button>
                </div>

                {open && (
                    <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-app-border bg-[#f8f7f3] p-2 shadow-[0_24px_70px_rgba(12,10,18,0.16)] md:hidden dark:bg-app-page">
                        <nav className="grid gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium transition ${
                                        isActive(item.url)
                                            ? 'bg-app-ink text-white dark:bg-app-surface-muted dark:text-app-ink'
                                            : 'text-app-muted hover:bg-white hover:text-app-ink dark:hover:bg-app-surface'
                                    }`}
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                    <ChevronRight className="size-4 opacity-50" />
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <main>{children}</main>

            <footer className="relative overflow-hidden border-t border-app-border/80 bg-[#f8f7f3] dark:bg-app-page">
                <div
                    className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                    aria-hidden="true"
                />
                <div
                    className="absolute top-0 left-1/2 h-px w-[min(72rem,82vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-app-red/35 to-transparent"
                    aria-hidden="true"
                />
                <div
                    className="absolute right-[12%] bottom-16 h-24 w-24 rounded-full border border-app-border/80 opacity-70"
                    aria-hidden="true"
                />
                <div className="relative mx-auto w-full max-w-7xl px-5 py-14 md:px-8 lg:py-18">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(34rem,0.95fr)] lg:items-end">
                        <div className="max-w-3xl">
                            <Link
                                href={home()}
                                className="group inline-flex items-center gap-3"
                            >
                                <span className="grid size-11 place-items-center overflow-hidden rounded-full bg-app-ink ring-1 ring-app-border transition duration-300 group-hover:scale-95 dark:bg-app-surface">
                                    <AppLogoIcon className="size-full object-cover" />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-app-ink">
                                        Knutsford SRC
                                    </span>
                                    <span className="block text-[0.68rem] font-semibold tracking-[0.18em] text-app-muted uppercase">
                                        Public portal
                                    </span>
                                </span>
                            </Link>

                            <p className="mt-8 max-w-2xl text-3xl leading-[1.06] font-semibold tracking-[-0.035em] text-app-ink md:text-5xl">
                                Student information, kept clear and easy to
                                reach.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <Link
                                    href={permitRequestIndex()}
                                    className="inline-flex items-center gap-2 rounded-full bg-app-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-app-red"
                                >
                                    Request permit
                                    <ArrowUpRight className="size-4" />
                                </Link>
                                <span className="public-hand rotate-[-2deg] text-base text-app-muted">
                                    official student desk
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2">
                            <FooterLinks
                                title="Browse"
                                items={navItems.slice(0, 3)}
                            />
                            <FooterLinks
                                title="Services"
                                items={navItems.slice(3)}
                            />
                        </div>
                    </div>

                    <div className="mt-12 grid gap-3 border-t border-app-border/70 pt-5 text-xs text-app-muted md:grid-cols-[1fr_auto] md:items-center">
                        <p>
                            © {new Date().getFullYear()} Knutsford University
                            SRC. Official student information portal.
                        </p>
                        <p className="font-semibold tracking-[0.16em] uppercase">
                            Notices · Events · Records · Services
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FooterLinks({
    title,
    items,
}: {
    title: string;
    items: typeof navItems;
}) {
    return (
        <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-app-muted uppercase">
                {title}
            </p>
            <ul className="mt-4 grid gap-1">
                {items.map((item) => (
                    <li key={item.label}>
                        <Link
                            href={item.href}
                            className="group flex items-center justify-between gap-3 border-b border-app-border/70 py-3 text-sm font-semibold text-app-ink transition hover:border-app-red/50 hover:text-app-red"
                        >
                            <span>{item.label}</span>
                            <ArrowUpRight className="size-3.5 opacity-35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
