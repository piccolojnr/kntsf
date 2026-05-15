import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { RouteDefinition } from '@/wayfinder';

type PublicCardProps = {
    title: string;
    description?: string | null;
    href: RouteDefinition<'get'>;
    imageUrl?: string | null;
    meta?: string | null;
    category?: string | null;
};

export function PublicContentCard({
    title,
    description,
    href,
    imageUrl,
    meta,
    category,
}: PublicCardProps) {
    return (
        <Link
            href={href}
            className="group flex flex-col overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-md"
        >
            {/* Thumbnail */}
            <div className="aspect-video shrink-0 overflow-hidden bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="size-full bg-muted" />
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-1.5 p-4">
                {/* Top row: category pill + date */}
                {(category || meta) && (
                    <div className="flex flex-wrap items-center gap-2">
                        {category && (
                            <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {category}
                            </span>
                        )}
                        {meta && (
                            <span className="text-[11px] text-muted-foreground">{meta}</span>
                        )}
                    </div>
                )}

                {/* Title */}
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {title}
                </h2>

                {/* Excerpt */}
                {description && (
                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                )}

                {/* Read more — appears on hover */}
                <div className="mt-auto flex items-center gap-1 pt-2 text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Read more <ArrowRight className="size-3" />
                </div>
            </div>
        </Link>
    );
}

/**
 * Skeleton placeholder shown while content is loading.
 * Use inside the same grid as PublicContentCard.
 */
export function PublicContentCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-md border bg-card">
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="flex flex-col gap-2 p-4">
                <div className="h-3 w-16 animate-pulse rounded-sm bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted mt-1" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
        </div>
    );
}

/**
 * Empty state shown when a section has no items.
 */
export function PublicContentEmpty({
    icon,
    message,
}: {
    icon?: React.ReactNode;
    message: string;
}) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed py-14 text-center">
            {icon && (
                <span className="mb-3 text-muted-foreground/30">{icon}</span>
            )}
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}
