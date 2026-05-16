import type { Executive } from '../types';

export function ExecutiveProfileCard({ executive }: { executive: Executive }) {
    const profile = executive.profile;

    return (
        <div className="rounded-md border bg-card p-4">
            <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                    {executive.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="font-medium">{executive.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {profile?.position ?? 'No position set'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {profile?.biography ?? 'No biography added yet.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
