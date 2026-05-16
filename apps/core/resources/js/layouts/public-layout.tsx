import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Landmark,
    LogIn,
    Menu,
    ShieldCheck,
    X,
} from 'lucide-react';
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
    {
        label: 'Announcements',
        href: announcementsIndex(),
        url: announcementsIndex.url(),
    },
    { label: 'Events', href: eventsIndex(), url: eventsIndex.url() },
    { label: 'Documents', href: documentsIndex(), url: documentsIndex.url() },
    { label: 'Executives', href: executivesIndex(), url: executivesIndex.url() },
    { label: 'Elections', href: electionsIndex(), url: electionsIndex.url() },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedPageProps>().props;
    const currentUrl = usePage().url;

    function isActive(href: string) {
        return currentUrl === href || currentUrl.startsWith(`${href}/`);
    }

    const ctaHref = auth.user ? dashboard() : login();
    const ctaLabel = auth.user ? 'Dashboard' : 'Staff Login';

    return (
        <div className="min-h-screen bg-[#f7f0df] text-[#17211b] selection:bg-[#d8a329] selection:text-[#17211b] dark:bg-[#0b100d] dark:text-[#f5ead2]">
            <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] [background-image:radial-gradient(#17211b_1px,transparent_1px)] [background-size:14px_14px] dark:opacity-[0.08] dark:[background-image:radial-gradient(#f5ead2_1px,transparent_1px)]" />
            <header className="sticky top-0 z-40 border-b border-[#1f2a24]/10 bg-[#f7f0df]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b100d]/92">
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
                    <Link href={home()} className="group flex items-center gap-3">
                        <div className="grid size-11 place-items-center border border-[#17211b] bg-[#17211b] text-[#f5ead2] shadow-[5px_5px_0_#d8a329] transition group-hover:-translate-y-0.5 dark:border-[#f5ead2] dark:bg-[#f5ead2] dark:text-[#17211b]">
                            <Landmark className="size-5" />
                        </div>
                        <div className="leading-tight">
                            <span className="block text-base font-black tracking-normal">
                                Knutsford SRC
                            </span>
                            <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[#b7352d]">
                                Public portal
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`relative px-3 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
                                    isActive(item.url)
                                        ? 'text-[#b7352d]'
                                        : 'text-[#566157] hover:text-[#17211b] dark:text-[#b8c3b8] dark:hover:text-[#f5ead2]'
                                }`}
                            >
                                {item.label}
                                {isActive(item.url) && (
                                    <span className="absolute inset-x-3 -bottom-1 h-1 bg-[#d8a329]" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        <div className="hidden items-center gap-2 border border-[#1f2a24]/10 bg-[#fffaf0] px-3 py-2 text-xs font-bold text-[#566157] xl:flex dark:border-white/10 dark:bg-[#111712] dark:text-[#b8c3b8]">
                            <ShieldCheck className="size-4 text-[#0f5b45] dark:text-[#d8a329]" />
                            Official SRC information
                        </div>
                        <Link
                            href={ctaHref}
                            className="inline-flex items-center gap-2 bg-[#17211b] px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-[#f5ead2] transition hover:bg-[#b7352d] dark:bg-[#f5ead2] dark:text-[#17211b] dark:hover:bg-[#d8a329]"
                        >
                            <LogIn className="size-4" />
                            {ctaLabel}
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="grid size-11 place-items-center border border-[#17211b]/20 bg-[#fffaf0] text-[#17211b] md:hidden dark:border-white/10 dark:bg-[#111712] dark:text-[#f5ead2]"
                        onClick={() => setOpen((value) => !value)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>

                {open && (
                    <div className="border-t border-[#1f2a24]/10 bg-[#f7f0df] px-5 py-4 md:hidden dark:border-white/10 dark:bg-[#0b100d]">
                        <nav className="grid gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center justify-between border px-4 py-3 text-sm font-black uppercase tracking-[0.14em] ${
                                        isActive(item.url)
                                            ? 'border-[#b7352d] bg-[#b7352d] text-white'
                                            : 'border-[#1f2a24]/10 bg-[#fffaf0] text-[#17211b] dark:border-white/10 dark:bg-[#111712] dark:text-[#f5ead2]'
                                    }`}
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                    <ChevronRight className="size-4" />
                                </Link>
                            ))}
                            <Link
                                href={ctaHref}
                                className="mt-2 flex items-center justify-between bg-[#17211b] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f5ead2]"
                                onClick={() => setOpen(false)}
                            >
                                {ctaLabel}
                                <ChevronRight className="size-4" />
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            <main className="relative z-10">{children}</main>

            <footer className="relative z-10 mt-20 border-t border-[#1f2a24]/10 bg-[#17211b] text-[#f5ead2] dark:border-white/10">
                <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1fr_auto_auto] md:px-8">
                    <div className="max-w-md">
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center border border-[#f5ead2]/30">
                                <BookOpen className="size-5 text-[#d8a329]" />
                            </div>
                            <div>
                                <p className="font-black">Knutsford SRC</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8a329]">
                                    Student voice, public record
                                </p>
                            </div>
                        </div>
                        <p className="mt-5 text-sm leading-6 text-[#c9c0aa]">
                            Official announcements, events, documents, leadership
                            profiles, and election information from the Student
                            Representative Council.
                        </p>
                    </div>

                    <div>
                        <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-[#d8a329]">
                            Portal
                        </p>
                        <ul className="grid gap-2">
                            {navItems.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-sm font-semibold text-[#c9c0aa] transition hover:text-[#f5ead2]"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-[#d8a329]">
                            Access
                        </p>
                        <Link
                            href={ctaHref}
                            className="inline-flex items-center gap-2 border border-[#f5ead2]/20 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#f5ead2] transition hover:bg-[#f5ead2] hover:text-[#17211b]"
                        >
                            {ctaLabel}
                            <ChevronRight className="size-4" />
                        </Link>
                    </div>
                </div>
                <div className="border-t border-[#f5ead2]/10 px-5 py-5 text-center text-xs font-semibold text-[#9f967f]">
                    © {new Date().getFullYear()} Knutsford University SRC.
                </div>
            </footer>
        </div>
    );
}
