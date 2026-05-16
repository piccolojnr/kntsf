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
    gold: 'bg-app-brass text-app-ink',
    green: 'bg-app-teal text-white',
    red: 'bg-app-red text-white',
    ink: 'bg-app-ink text-app-surface',
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
            className="public-panel group relative flex min-h-[24rem] flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(22,30,25,0.14)]"
        >
            <div className="absolute left-0 top-0 z-10 h-full w-1.5 bg-app-red" />

            <div className="relative aspect-[4/3] overflow-hidden bg-app-surface-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="size-full object-cover saturate-[0.92] transition duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,var(--app-surface-muted)_0%,var(--app-surface)_48%,color-mix(in_srgb,var(--app-teal)_16%,var(--app-surface))_100%)]">
                        <div className="grid size-24 place-items-center rounded-md border border-app-border bg-app-surface/75">
                            <FileText className="size-8 text-app-teal" />
                        </div>
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
                {category && (
                    <span
                        className={`absolute left-5 top-5 rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${toneClasses[tone]}`}
                    >
                        {category}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                {meta && (
                    <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-app-red dark:text-app-brass">
                        {meta}
                    </p>
                )}
                <h2 className="text-xl font-black leading-tight tracking-normal text-app-ink">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-app-muted">
                        {description}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="h-px flex-1 bg-app-border" />
                    <span className="ml-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-app-teal dark:text-app-brass">
                        Open
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
        <div className="col-span-full grid min-h-72 place-items-center rounded-md border border-dashed border-app-border bg-app-surface/70 px-6 text-center">
            <div>
                {icon && (
                    <span className="mx-auto mb-5 grid size-16 place-items-center rounded-md border border-app-border bg-app-surface-muted text-app-teal dark:text-app-brass">
                        {icon}
                    </span>
                )}
                <p className="max-w-sm text-sm font-semibold leading-6 text-app-muted">
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
        <section className="relative overflow-hidden border-b border-app-border bg-app-surface-muted">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,#17211b_1px,transparent_1px),linear-gradient(#17211b_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 md:px-8 lg:grid-cols-[1fr_18rem] lg:py-20">
                <div>
                    <p className="public-kicker tracking-[0.28em]">
                        {eyebrow}
                    </p>
                    <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-app-ink md:text-7xl">
                        {title}
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-app-muted">
                        {description}
                    </p>
                </div>
                {count !== undefined && (
                    <div className="flex items-end">
                        <div className="w-full rounded-md border border-app-ink bg-app-ink p-5 text-app-surface shadow-[10px_10px_0_var(--app-brass)]">
                            <p className="text-5xl font-black">{count}</p>
                            <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-app-brass">
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
                        className={`rounded-md border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                            link.active
                                ? 'border-app-ink bg-app-ink text-app-surface dark:border-app-surface dark:bg-app-surface dark:text-app-ink'
                                : 'border-app-border bg-app-surface text-app-ink hover:border-app-red'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded-md border border-app-border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-app-muted"
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
