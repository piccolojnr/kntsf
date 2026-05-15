import { Link, usePage } from '@inertiajs/react';
import { Menu, ShieldCheck, X } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
                    <Link href={home()} className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Knutsford SRC
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Public portal
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        <Button asChild variant="outline" size="sm">
                            <Link href={auth.user ? dashboard() : login()}>
                                {auth.user ? 'Dashboard' : 'Login'}
                            </Link>
                        </Button>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setOpen((current) => !current)}
                    >
                        {open ? <X /> : <Menu />}
                        <span className="sr-only">Toggle navigation</span>
                    </Button>
                </div>

                {open && (
                    <div className="border-t md:hidden">
                        <nav className="mx-auto grid w-full max-w-6xl gap-1 px-4 py-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                                onClick={() => setOpen(false)}
                            >
                                {auth.user ? 'Dashboard' : 'Login'}
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            <main>{children}</main>

            <footer className="border-t">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
                    <p>Knutsford SRC public information portal.</p>
                    <p>Announcements, events, documents, and leadership updates.</p>
                </div>
            </footer>
        </div>
    );
}
