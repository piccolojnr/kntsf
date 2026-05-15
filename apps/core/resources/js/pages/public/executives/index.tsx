import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { PublicContentEmpty } from '@/features/public/content-card';
import { RichTextViewer } from '@/features/content/components/rich-text-viewer';
import type { ExecutiveSummary } from '../types';

export default function PublicExecutivesIndex({
    executives,
}: {
    executives: ExecutiveSummary[];
}) {
    return (
        <>
            <Head title="SRC Executives" />

            {/* Page header */}
            <div className="border-b bg-muted/30">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                        SRC Portal
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">SRC Executives</h1>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Meet the elected student leaders representing you on the Student Representative Council.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                {executives.length === 0 ? (
                    <div className="grid grid-cols-1">
                        <PublicContentEmpty
                            icon={<Users className="size-8" />}
                            message="No executive profiles have been published."
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                        {executives.map((executive) => (
                            <article
                                key={executive.id}
                                className="rounded-md border bg-card p-5"
                            >
                                {/* Avatar */}
                                <div className="mb-4 flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-border">
                                    {executive.avatar_url ? (
                                        <img
                                            src={executive.avatar_url}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-bold text-muted-foreground">
                                            {executive.name?.slice(0, 1) ?? 'E'}
                                        </span>
                                    )}
                                </div>

                                {/* Name + position */}
                                <h2 className="font-bold leading-snug">{executive.name}</h2>
                                <p className="mt-0.5 text-xs font-semibold text-primary">
                                    {executive.position}
                                </p>

                                {/* Position description */}
                                {executive.position_description && (
                                    <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                                        {executive.position_description}
                                    </p>
                                )}

                                {/* Biography */}
                                {executive.biography && (
                                    <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                                        <RichTextViewer value={executive.biography} />
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
