import { Link } from '@inertiajs/react';
import { ArrowRight, FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RouteDefinition } from '@/wayfinder';

type PublicCardProps = {
    title: string;
    description?: string | null;
    href: RouteDefinition<'get'>;
    imageUrl?: string | null;
    meta?: string | null;
    category?: string | null;
    tone?: 'gold' | 'green' | 'red' | 'ink';
};

const toneClasses = {
    gold: 'bg-amber-50/90 text-amber-800 border border-amber-200/40 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30',
    green: 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/40 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30',
    red: 'bg-rose-50/90 text-rose-800 border border-rose-200/40 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/30',
    ink: 'bg-slate-50/90 text-slate-800 border border-slate-200/40 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800/30',
};

export function PublicContentCard({
    title,
    description,
    href,
    imageUrl,
    meta,
    category,
    tone = 'green',
}: PublicCardProps) {
    return (
        <Link
            href={href}
            className="group relative flex min-h-[25rem] flex-col overflow-hidden rounded-3xl border border-app-border/30 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.015)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(68,46,102,0.06)] dark:border-app-border/20 dark:bg-app-surface/60 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-app-surface-muted/40">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="size-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-app-surface-muted/40 via-app-surface/20 to-app-teal/5">
                        <div className="grid size-16 place-items-center rounded-2xl border border-app-border/40 bg-white/80 shadow-sm dark:bg-app-surface/80">
                            <FileText className="size-6 text-app-teal" />
                        </div>
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                {category && (
                    <span
                        className={`absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider backdrop-blur-md shadow-sm transition duration-300 ${toneClasses[tone]}`}
                    >
                        {category}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6">
                {meta && (
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-app-red dark:text-app-brass/90">
                        {meta}
                    </p>
                )}
                <h2 className="text-lg font-bold leading-snug tracking-tight text-app-ink transition-colors duration-300 group-hover:text-app-teal dark:group-hover:text-app-brass md:text-xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-app-muted/90">
                        {description}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="h-px flex-1 bg-app-border/30" />
                    <span className="ml-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-app-teal transition-all duration-300 group-hover:translate-x-0.5 dark:text-app-brass">
                        Open
                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export function PublicContentEmpty({
    icon,
    message,
}: {
    icon?: ReactNode;
    message: string;
}) {
    return (
        <div className="col-span-full grid min-h-72 place-items-center rounded-3xl border border-dashed border-app-border/40 bg-white/30 px-6 text-center backdrop-blur-sm dark:bg-app-surface/20">
            <div>
                {icon && (
                    <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-app-border/30 bg-app-surface-muted/50 text-app-teal dark:text-app-brass">
                        {icon}
                    </span>
                )}
                <p className="max-w-sm text-sm font-medium leading-relaxed text-app-muted">
                    {message}
                </p>
            </div>
        </div>
    );
}

export function PublicPageHeader({
    eyebrow,
    title,
    description,
    count,
}: {
    eyebrow: string;
    title: string;
    description: string;
    count?: number;
}) {
    return (
        <section className="relative overflow-hidden border-b border-app-border/35 bg-gradient-to-b from-app-surface-muted/40 via-app-surface-muted/10 to-transparent">
            {/* Soft backdrop blur & gradient mesh */}
            <div className="absolute top-0 right-1/4 -z-10 size-[32rem] rounded-full bg-app-teal/5 blur-3xl opacity-60 dark:bg-app-brass/5" />
            <div className="absolute bottom-0 left-10 -z-10 size-[24rem] rounded-full bg-app-red/5 blur-3xl opacity-40" />

            <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(90deg,#17211b_1px,transparent_1px),linear-gradient(#17211b_1px,transparent_1px)] [background-size:42px_42px] dark:opacity-[0.06] dark:[background-image:linear-gradient(90deg,#ffffff_1px,transparent_1px),linear-gradient(#ffffff_1px,transparent_1px)]" />

            <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 md:px-8 lg:grid-cols-[1fr_20rem] lg:py-20">
                <div className="flex flex-col justify-center">
                    <p className="inline-flex max-w-max items-center rounded-full bg-app-red/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-app-red dark:bg-app-brass/10 dark:text-app-brass">
                        {eyebrow}
                    </p>
                    <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-app-ink md:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-app-muted">
                        {description}
                    </p>
                </div>
                {count !== undefined && (
                    <div className="flex items-end">
                        <div className="w-full rounded-3xl border border-app-border/40 bg-white/70 p-6 shadow-xl shadow-app-teal/5 backdrop-blur-md transition-all duration-500 hover:shadow-2xl hover:shadow-app-teal/8 dark:bg-app-surface/70">
                            <p className="text-5xl font-black text-app-teal dark:text-app-brass">{count}</p>
                            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-app-muted">
                                Published records
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export function PublicPagination({
    links,
}: {
    links?: Array<{ url: string | null; label: string; active: boolean }>;
}) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <nav className="mt-12 flex flex-wrap justify-center gap-2">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        className={`rounded-full border px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${link.active
                            ? 'border-app-teal bg-app-teal text-white shadow-md shadow-app-teal/15 dark:border-app-brass dark:bg-app-brass dark:text-app-ink'
                            : 'border-app-border bg-white text-app-ink hover:border-app-teal hover:bg-app-teal/5 dark:border-app-border/30 dark:bg-app-surface dark:hover:border-app-brass dark:hover:bg-app-brass/5'
                            }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded-full border border-app-border/30 bg-white/50 px-5 py-2.5 text-xs font-bold tracking-wide text-app-muted/60 dark:bg-app-surface/50"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </nav>
    );
}

export function formatPublicDate(value: string | null, long = false) {
    return value
        ? new Date(value).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: long ? 'long' : 'short',
            year: 'numeric',
        })
        : null;
}



