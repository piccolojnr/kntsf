import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BookOpen,
    CreditCard,
    ShieldCheck,
    UsersRound
    
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import { dashboard, login } from '@/routes';
import type { SharedPageProps } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedPageProps>().props;

    return (
        <>
            <Head title="Welcome" />

            <main className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
                    <Link
                        href={auth.user ? dashboard() : login()}
                        className="flex items-center gap-3"
                    >
                        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                KNTSF Core
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Student operations
                            </p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2 text-sm">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex h-9 items-center gap-2 rounded-md border px-3 font-medium hover:bg-muted"
                            >
                                Dashboard
                                <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex h-9 items-center rounded-md px-3 font-medium hover:bg-muted"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <section className="mx-auto grid min-h-[calc(100vh-76px)] w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="max-w-2xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            <BadgeCheck className="size-4 text-primary" />
                            Foundation ready for student records
                        </div>
                        <h1 className="max-w-xl text-4xl font-semibold tracking-normal text-balance md:text-5xl">
                            Student records, account activation, and campus
                            operations in one workspace.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                            Manage student profiles now, then layer in permits,
                            NFC verification, payments, events, and reporting as
                            the system grows.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                {auth.user ? 'Open dashboard' : 'Log in'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between border-b pb-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Operations overview
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Current foundation modules
                                </p>
                            </div>
                            <span className="rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                                Live workspace
                            </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <PreviewTile
                                icon={UsersRound}
                                label="Students"
                                value="Profiles and activation"
                            />
                            <PreviewTile
                                icon={BookOpen}
                                label="Courses"
                                value="Configurable lists"
                            />
                            <PreviewTile
                                icon={ShieldCheck}
                                label="Permissions"
                                value="Role based access"
                            />
                            <PreviewTile
                                icon={CreditCard}
                                label="Payments"
                                value="Planned module"
                            />
                        </div>

                        <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    Student activation
                                </p>
                                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                    Ready
                                </span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    'Create profile',
                                    'Link user account',
                                    'Send setup password link',
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <BadgeCheck className="size-4 text-primary" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function PreviewTile({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border bg-background p-4">
            <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-5" />
            </div>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{value}</p>
        </div>
    );
}
