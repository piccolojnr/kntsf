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
        <div className="px-4 py-6 lg:px-6">
            <div className="mb-8">
                <Heading
                    title="Settings"
                    description="Manage your profile, security, appearance, and platform configuration."
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
                <aside className="w-full">
                    <div className="mb-3 hidden rounded-lg border bg-card p-4 shadow-xs lg:block">
                        <p className="text-sm font-medium">Settings menu</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Links are shown based on your permissions.
                        </p>
                    </div>
                    <nav
                        className="grid gap-1 rounded-lg border bg-card p-2 shadow-xs sm:grid-cols-2 lg:grid-cols-1"
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
                                        'bg-muted text-foreground shadow-xs':
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
                    <section className="max-w-3xl rounded-lg border bg-card p-5 shadow-xs sm:p-6">
                        <div className="max-w-xl space-y-12">{children}</div>
                    </section>
                </div>
            </div>
        </div>
    );
}
