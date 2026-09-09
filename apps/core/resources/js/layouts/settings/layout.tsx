import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { filterNavItemsForUser } from '@/navigation/filter-nav-items';
import { settingsNavItems } from '@/navigation/settings-nav';
import type { SharedPageProps } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedPageProps>().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const visibleSettingsNavItems = filterNavItemsForUser(
        settingsNavItems,
        auth,
    );

    return (
        <div className="app-page px-4 py-6 lg:px-6">
            <div className="app-panel mb-6 p-5">
                <Heading
                    title="Settings"
                    description="Manage your profile, security, appearance, and platform configuration."
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
                <aside className="w-full">
                    <div className="app-panel mb-3 hidden p-4 lg:block">
                        <p className="app-kicker">Settings menu</p>
                        <p className="mt-2 text-sm font-black">Account controls</p>
                        <p className="app-muted mt-1 text-xs">
                            Links are shown based on your permissions.
                        </p>
                    </div>
                    <nav
                        className="app-panel grid gap-1 p-2 sm:grid-cols-2 lg:grid-cols-1"
                        aria-label="Settings"
                    >
                        {visibleSettingsNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="default"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium',
                                    {
                                        'bg-app-surface-muted text-app-ink shadow-[inset_3px_0_0_var(--app-brass)]':
                                            isCurrentOrParentUrl(item.href),
                                    },
                                )}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="min-w-0 flex-1">
                    <section className="app-panel max-w-3xl p-5 sm:p-6">
                        <div className="max-w-xl space-y-12">{children}</div>
                    </section>
                </div>
            </div>
        </div>
    );
}
