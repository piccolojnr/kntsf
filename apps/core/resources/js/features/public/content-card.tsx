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
    gold: 'bg-app-brass/12 text-app-ink',
    green: 'bg-app-surface-muted text-app-ink',
    red: 'bg-app-red/10 text-app-red',
    ink: 'bg-app-ink/8 text-app-ink dark:bg-white/10',
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
            className="group relative flex min-h-[24rem] flex-col overflow-hidden rounded-xl border border-app-border bg-white/72 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm dark:bg-app-surface/70"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-app-surface-muted/70 dark:bg-app-page">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="size-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <div className="grid size-14 place-items-center rounded-full bg-white text-app-muted transition duration-300 group-hover:bg-app-ink group-hover:text-white dark:bg-app-surface">
                            <FileText className="size-5" />
                        </div>
                    </div>
                )}
                {category && (
                    <span
                        className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase transition duration-300 ${toneClasses[tone]}`}
                    >
                        {category}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6">
                {meta && (
                    <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-app-muted uppercase">
                        {meta}
                    </p>
                )}
                <h2 className="text-xl leading-tight font-semibold tracking-[-0.02em] text-app-ink transition-colors duration-300 group-hover:text-app-red md:text-2xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3.5 line-clamp-3 text-sm leading-7 text-app-muted/90">
                        {description}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="h-px flex-1 bg-app-border" />
                    <span className="ml-4 inline-flex items-center gap-1.5 text-xs font-medium text-app-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-app-red">
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
        <div className="col-span-full grid min-h-72 place-items-center rounded-xl border border-dashed border-app-border bg-white/55 px-6 text-center dark:bg-app-surface/50">
            <div>
                {icon && (
                    <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-app-surface-muted text-app-muted dark:bg-app-page">
                        {icon}
                    </span>
                )}
                <p className="max-w-sm text-sm leading-7 text-app-muted">
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
        <section className="border-b border-app-border/80">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 md:px-8 lg:grid-cols-[1fr_16rem] lg:py-18">
                <div className="flex flex-col justify-center">
                    <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                        {eyebrow}
                    </p>
                    <h1 className="mt-4 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-app-ink md:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-app-muted">
                        {description}
                    </p>
                </div>
                {count !== undefined && (
                    <div className="flex items-end">
                        <div className="w-full rounded-xl border border-app-border bg-white/70 p-5 dark:bg-app-surface/70">
                            <p className="text-4xl font-semibold tracking-[-0.04em] text-app-ink">
                                {count}
                            </p>
                            <p className="mt-2 text-xs font-medium tracking-[0.18em] text-app-muted uppercase">
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
                        className={`rounded-full border px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${
                            link.active
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
