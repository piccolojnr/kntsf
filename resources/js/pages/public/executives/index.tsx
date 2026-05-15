import { Head } from '@inertiajs/react';
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
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold">SRC Executives</h1>
                    <p className="mt-2 text-muted-foreground">
                        Published leadership profiles.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {executives.map((executive) => (
                        <article
                            key={executive.id}
                            className="rounded-lg border bg-card p-5"
                        >
                            <div className="mb-4 flex size-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                {executive.avatar_url ? (
                                    <img
                                        src={executive.avatar_url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="text-lg font-semibold">
                                        {executive.name?.slice(0, 1) ?? 'E'}
                                    </span>
                                )}
                            </div>
                            <h2 className="font-semibold">{executive.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                {executive.position}
                            </p>
                            {executive.position_description && (
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    {executive.position_description}
                                </p>
                            )}
                            {executive.biography && (
                                <div className="mt-4">
                                    <RichTextViewer value={executive.biography} />
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}
