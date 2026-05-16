import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import {
    PublicContentEmpty,
    PublicPageHeader,
} from '@/features/public/content-card';
import type { ExecutiveSummary } from '../types';

export default function PublicExecutivesIndex({
    executives,
}: {
    executives: ExecutiveSummary[];
}) {
    return (
        <>
            <Head title="SRC Executives" />
            <PublicPageHeader
                eyebrow="Leadership"
                title="SRC Executives"
                description="Meet the student leaders representing the campus through the Student Representative Council."
                count={executives.length}
            />

            <section className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
                {executives.length === 0 ? (
                    <div className="grid grid-cols-1">
                        <PublicContentEmpty
                            icon={<Users className="size-8" />}
                            message="No executive profiles have been published."
                        />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {executives.map((executive, index) => (
                            <article
                                key={executive.id}
                                className={`public-panel overflow-hidden ${
                                    index === 0 ? 'md:col-span-2 xl:col-span-1' : ''
                                }`}
                            >
                                <div className="relative aspect-[5/4] bg-app-surface-muted">
                                    {executive.avatar_url ? (
                                        <img
                                            src={executive.avatar_url}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid size-full place-items-center">
                                            <Users className="size-16 text-app-teal/30 dark:text-app-brass/30" />
                                        </div>
                                    )}
                                    {executive.category && (
                                        <span className="absolute left-5 top-5 rounded-md bg-app-red px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
                                            {executive.category}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h2 className="text-3xl font-black leading-tight">
                                        {executive.name}
                                    </h2>
                                    <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-app-teal dark:text-app-brass">
                                        {executive.position}
                                    </p>
                                    {executive.position_description && (
                                        <p className="mt-4 text-sm font-semibold leading-6 text-app-muted">
                                            {executive.position_description}
                                        </p>
                                    )}
                                    {executive.biography && (
                                        <div className="mt-5 border-t border-app-border pt-5 text-sm text-app-muted">
                                            <RichTextViewer value={executive.biography} />
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
