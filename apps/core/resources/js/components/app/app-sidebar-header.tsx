import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import AppearanceTabs from '@/components/settings/appearance-tabs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { index as permitsIndex } from '@/routes/permits';
import type {
    BreadcrumbItem as BreadcrumbItemType,
    SharedPageProps,
} from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedPageProps>().props;
    const canIssuePermit =
        auth.user?.permissions.includes('permits.issue') === true;

    return (
        <header className="sticky top-0 z-20 m-3 mb-0 flex h-16 shrink-0 items-center justify-between gap-3 rounded-[1.1rem] border border-app-border bg-white/82 px-4 shadow-[0_18px_55px_rgba(23,33,27,0.08)] backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:mx-5 md:px-5 dark:bg-app-surface/82 dark:shadow-none">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 rounded-full border border-app-border bg-app-surface text-app-ink hover:bg-app-surface-muted" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {canIssuePermit && (
                    <Button
                        size="sm"
                        className="theme-primary-action h-[39.5px] w-[39.5px] px-0 sm:w-auto sm:px-3"
                        onClick={() =>
                            router.get(
                                permitsIndex.url({
                                    query: { issue: Date.now() },
                                }),
                                {},
                                { preserveState: false, preserveScroll: true },
                            )
                        }
                    >
                        <Plus />
                        <span className="hidden sm:inline">Issue permit</span>
                    </Button>
                )}

                <AppearanceTabs compact />
            </div>
        </header>
    );
}
