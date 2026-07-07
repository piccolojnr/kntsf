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
            className="public-sketch-card public-scroll-rise group relative flex min-h-[19.5rem] flex-col overflow-hidden rounded-[1.25rem] border border-app-border bg-white/76 shadow-[0_14px_42px_rgba(28,24,38,0.05)] transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:bg-app-surface/70"
        >
            <div className="relative aspect-[16/9] overflow-hidden bg-app-surface-muted/70 dark:bg-app-page">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="public-scroll-drift size-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="public-paper-grain flex size-full items-center justify-center">
                        <div
                            className="public-float absolute top-6 right-7 size-20 rounded-full border border-dashed border-app-ink/12"
                            aria-hidden="true"
                        />
                        <div
                            className="absolute right-8 bottom-6 h-14 w-28 rotate-[-8deg] rounded-full bg-app-brass/18 blur-2xl"
                            aria-hidden="true"
                        />
                        <div className="relative grid size-12 place-items-center rounded-full bg-white text-app-muted transition duration-300 group-hover:scale-110 group-hover:rotate-[-7deg] group-hover:bg-app-ink group-hover:text-white dark:bg-app-surface">
                            <FileText className="size-5" />
                        </div>
                    </div>
                )}
                <div
                    className="absolute inset-3 rounded-[0.9rem] border border-white/18"
                    aria-hidden="true"
                />
                {category && (
                    <span
                        className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase shadow-[0_10px_30px_rgba(12,10,18,0.08)] transition duration-300 ${toneClasses[tone]}`}
                    >
                        {category}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                {meta && (
                    <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-app-muted uppercase">
                        {meta}
                    </p>
                )}
                <h2 className="text-lg leading-tight font-semibold tracking-[-0.02em] text-app-ink transition-colors duration-300 group-hover:text-app-red md:text-xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-app-muted/90">
                        {description}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-5">
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
        <div className="public-sketch-card public-paper-grain relative col-span-full min-h-80 overflow-hidden rounded-[1.4rem] border border-app-border bg-white/64 p-6 dark:bg-app-surface/50">
            <div
                className="public-float absolute top-8 right-9 size-24 rounded-full border border-dashed border-app-ink/12"
                aria-hidden="true"
            />
            <div
                className="absolute right-12 bottom-10 h-24 w-40 rotate-[-8deg] rounded-full bg-app-brass/18 blur-2xl"
                aria-hidden="true"
            />
            <div className="relative flex min-h-68 flex-col justify-between">
                {icon && (
                    <span className="grid size-14 place-items-center rounded-full bg-app-ink/6 text-app-muted dark:bg-app-page">
                        {icon}
                    </span>
                )}
                <div>
                    <div
                        className="public-empty-lines mb-6 h-20 max-w-sm"
                        aria-hidden="true"
                    />
                    <p className="max-w-sm text-sm leading-7 text-app-muted">
                        {message}
                    </p>
                    <p className="public-hand mt-3 rotate-[-2deg] text-base text-app-muted/80">
                        space reserved
                    </p>
                </div>
            </div>
        </div>
    );
}

export function PublicPageHeader({
    eyebrow,
    title,
    description,
    count,
    backgroundImageUrl,
}: {
    eyebrow: string;
    title: string;
    description: string;
    count?: number;
    backgroundImageUrl?: string | null;
}) {
    const hasBackgroundImage = Boolean(backgroundImageUrl);

    return (
        <section
            className={`relative overflow-hidden border-app-border/80 ${
                hasBackgroundImage ? 'bg-app-ink text-white' : 'bg-[#f8f7f3]'
            }`}
        >
            {backgroundImageUrl && (
                <>
                    <img
                        src={backgroundImageUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                    />
                    <div
                        className="absolute inset-0 bg-app-ink/28"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_46%,rgba(17,14,26,0.74),rgba(17,14,26,0.38)_38%,rgba(17,14,26,0.12)_70%)]"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-app-ink/34 to-transparent"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8f7f3] via-[#f8f7f3]/34 to-transparent"
                        aria-hidden="true"
                    />
                </>
            )}
            <div
                className={`public-notebook-grid pointer-events-none absolute inset-0 ${
                    hasBackgroundImage ? 'opacity-15' : 'opacity-35'
                }`}
                aria-hidden="true"
            />
            <div
                className={`public-float pointer-events-none absolute -top-12 right-[14%] size-36 rounded-full border border-dashed ${
                    hasBackgroundImage ? 'border-white/18' : 'border-app-ink/10'
                }`}
                aria-hidden="true"
            />
            <div
                className={`public-scroll-rise relative mx-auto grid w-full max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-[1fr_16rem] ${
                    hasBackgroundImage
                        ? 'min-h-[76svh] items-end pt-28 pb-18 md:min-h-[90svh] lg:pt-32 lg:pb-24'
                        : 'pt-32 pb-14 lg:pt-36 lg:pb-18'
                }`}
            >
                <div className="flex flex-col justify-center">
                    <p
                        className={`text-xs font-semibold tracking-[0.22em] uppercase ${
                            hasBackgroundImage ? 'text-app-brass' : 'text-app-red'
                        }`}
                    >
                        {eyebrow}
                    </p>
                    <h1
                        className={`mt-4 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.03em] md:text-6xl ${
                            hasBackgroundImage ? 'text-white' : 'text-app-ink'
                        }`}
                    >
                        {title}
                    </h1>
                    <p
                        className={`mt-5 max-w-2xl text-base leading-8 ${
                            hasBackgroundImage ? 'text-white/76' : 'text-app-muted'
                        }`}
                    >
                        {description}
                    </p>
                    <p
                        className={`public-hand public-scroll-mark mt-6 rotate-[-2deg] text-base ${
                            hasBackgroundImage ? 'text-white/72' : 'text-app-muted'
                        }`}
                    >
                        public record
                    </p>
                </div>
                {count !== undefined && (
                    <div className="flex items-end">
                        <div
                            className={`public-sketch-card w-full rounded-[1.2rem] border p-5 shadow-[0_14px_45px_rgba(28,24,38,0.045)] ${
                                hasBackgroundImage
                                    ? 'border-white/16 bg-white/12 backdrop-blur-md'
                                    : 'border-app-border bg-white/72 dark:bg-app-surface/70'
                            }`}
                        >
                            <p
                                className={`text-4xl font-semibold tracking-[-0.04em] ${
                                    hasBackgroundImage ? 'text-white' : 'text-app-ink'
                                }`}
                            >
                                {count}
                            </p>
                            <p
                                className={`mt-2 text-xs font-medium tracking-[0.18em] uppercase ${
                                    hasBackgroundImage
                                        ? 'text-white/66'
                                        : 'text-app-muted'
                                }`}
                            >
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
                                ? 'border-app-ink bg-app-ink text-white shadow-md shadow-app-ink/15 dark:border-app-brass dark:bg-app-brass dark:text-app-ink'
                                : 'border-app-border bg-white/72 text-app-ink hover:border-app-red hover:bg-app-red/5 hover:text-app-red dark:border-app-border/30 dark:bg-app-surface dark:hover:border-app-brass dark:hover:bg-app-brass/5'
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
