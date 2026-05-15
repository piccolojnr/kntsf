import { Link } from '@inertiajs/react';
import type { RouteDefinition } from '@/wayfinder';

type PublicCardProps = {
    title: string;
    description?: string | null;
    href: RouteDefinition<'get'>;
    imageUrl?: string | null;
    meta?: string | null;
};

export function PublicContentCard({
    title,
    description,
    href,
    imageUrl,
    meta,
}: PublicCardProps) {
    return (
        <Link
            href={href}
            className="group overflow-hidden rounded-lg border bg-card transition hover:border-primary/50 hover:shadow-sm"
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt=""
                    className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"
                />
            ) : (
                <div className="aspect-video bg-muted" />
            )}
            <div className="space-y-2 p-4">
                {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
                <h2 className="line-clamp-2 text-sm font-semibold">{title}</h2>
                {description && (
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </Link>
    );
}
