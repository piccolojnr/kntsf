import type { ReactNode } from 'react';

export function ContentFormShell({
    main,
    sidebar,
}: {
    main: ReactNode;
    sidebar: ReactNode;
}) {
    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <div className="space-y-5">{main}</div>
            <aside className="space-y-5">{sidebar}</aside>
        </div>
    );
}
