import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Menu, ShieldCheck, X } from 'lucide-react';
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
    const isHome = currentUrl === '/' || currentUrl.startsWith('/?');
    const hasImageBackedHeader =
        isHome  || currentUrl.startsWith(eventsIndex.url()) || currentUrl.startsWith(announcementsIndex.url());
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
                <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
                    <div className="max-w-sm">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3"
                        >
                            <span className="grid size-9 place-items-center overflow-hidden rounded-md bg-app-ink dark:bg-app-surface">
                                <AppLogoIcon className="size-full object-cover" />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-app-ink">
                                    Knutsford SRC
                                </span>
                                <span className="block text-xs text-app-muted">
                                    Student Representative Council
                                </span>
                            </span>
                        </Link>
                        <p className="mt-5 text-sm leading-7 text-app-muted">
                            A calm public record for notices, events, documents,
                            leadership, elections, and student services.
                        </p>
                        <p className="public-hand mt-5 rotate-[-2deg] text-base text-app-muted">
                            official student desk
                        </p>
                    </div>

                    <FooterLinks title="Browse" items={navItems.slice(0, 3)} />
                    <FooterLinks title="Services" items={navItems.slice(3)} />
                </div>

                <div className="relative border-t border-app-border/70 px-5 py-5 text-xs text-app-muted">
                    <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <span>
                            © {new Date().getFullYear()} Knutsford University
                            SRC.
                        </span>
                        <span>Official student information portal.</span>
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
        <div className="rounded-[1.2rem] border border-app-border bg-white/48 p-5 dark:bg-app-surface/40">
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-app-muted uppercase">
                {title}
            </p>
            <ul className="grid gap-3">
                {items.map((item) => (
                    <li key={item.label}>
                        <Link
                            href={item.href}
                            className="text-sm font-medium text-app-ink transition hover:text-app-red"
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
