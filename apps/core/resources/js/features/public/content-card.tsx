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
    gold: 'bg-[#d8a329] text-[#171407]',
    green: 'bg-[#0f5b45] text-white',
    red: 'bg-[#b7352d] text-white',
    ink: 'bg-[#20251f] text-[#f4ead4]',
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
            className="group relative flex min-h-[24rem] flex-col overflow-hidden rounded-none border border-[#1f2a24]/15 bg-[#fffaf0] shadow-[0_18px_50px_rgba(22,30,25,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(22,30,25,0.14)] dark:border-white/10 dark:bg-[#111712]"
        >
            <div className="absolute left-0 top-0 z-10 h-full w-1.5 bg-[#b7352d]" />

            <div className="relative aspect-[4/3] overflow-hidden bg-[#efe3c6]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="size-full object-cover saturate-[0.92] transition duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#efe3c6_0%,#f8f0dc_48%,#d7e4d4_100%)]">
                        <div className="grid size-24 place-items-center border border-[#1f2a24]/20 bg-[#fffaf0]/70">
                            <FileText className="size-8 text-[#0f5b45]" />
                        </div>
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
                {category && (
                    <span
                        className={`absolute left-5 top-5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${toneClasses[tone]}`}
                    >
                        {category}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                {meta && (
                    <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#b7352d] dark:text-[#e5ba4f]">
                        {meta}
                    </p>
                )}
                <h2 className="text-xl font-black leading-tight tracking-normal text-[#17211b] dark:text-[#f5ead2]">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5f665d] dark:text-[#b8c3b8]">
                        {description}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="h-px flex-1 bg-[#1f2a24]/15 dark:bg-white/10" />
                    <span className="ml-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0f5b45] dark:text-[#e5ba4f]">
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
        <div className="col-span-full grid min-h-72 place-items-center border border-dashed border-[#1f2a24]/25 bg-[#fffaf0]/70 px-6 text-center dark:border-white/15 dark:bg-[#111712]">
            <div>
                {icon && (
                    <span className="mx-auto mb-5 grid size-16 place-items-center border border-[#1f2a24]/15 bg-[#efe3c6] text-[#0f5b45] dark:border-white/10 dark:bg-[#1b241d] dark:text-[#e5ba4f]">
                        {icon}
                    </span>
                )}
                <p className="max-w-sm text-sm font-semibold leading-6 text-[#5f665d] dark:text-[#b8c3b8]">
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
        <section className="relative overflow-hidden border-b border-[#1f2a24]/10 bg-[#efe3c6] dark:border-white/10 dark:bg-[#111712]">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,#17211b_1px,transparent_1px),linear-gradient(#17211b_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 md:px-8 lg:grid-cols-[1fr_18rem] lg:py-20">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-[#b7352d]">
                        {eyebrow}
                    </p>
                    <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-[#17211b] dark:text-[#f5ead2] md:text-7xl">
                        {title}
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-[#596257] dark:text-[#b8c3b8]">
                        {description}
                    </p>
                </div>
                {count !== undefined && (
                    <div className="flex items-end">
                        <div className="w-full border border-[#17211b] bg-[#17211b] p-5 text-[#f5ead2] shadow-[10px_10px_0_#d8a329]">
                            <p className="text-5xl font-black">{count}</p>
                            <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-[#d8a329]">
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
                        className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                            link.active
                                ? 'border-[#17211b] bg-[#17211b] text-[#f5ead2] dark:border-[#f5ead2] dark:bg-[#f5ead2] dark:text-[#17211b]'
                                : 'border-[#1f2a24]/15 bg-[#fffaf0] text-[#17211b] hover:border-[#b7352d] dark:border-white/10 dark:bg-[#111712] dark:text-[#f5ead2]'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="border border-[#1f2a24]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#8a8f86] dark:border-white/10"
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
