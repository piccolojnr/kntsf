import type { Executive } from '../types';

export function ExecutiveProfileCard({ executive }: { executive: Executive }) {
    const profile = executive.profile;

    return (
        <div className="app-panel p-5">
            <div className="flex items-start gap-4">
                <div className="theme-primary-active flex size-14 shrink-0 items-center justify-center rounded-[1rem] text-sm font-semibold">
                    {executive.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-app-ink">
                        {executive.name}
                    </p>
                    <p className="mt-1 text-sm text-app-muted">
                        {profile?.position ?? 'No position set'}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-app-muted">
                        {profile?.biography ?? 'No biography added yet.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
