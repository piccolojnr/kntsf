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
        auth?.user?.permissions.includes('permits.issue') === true;

    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-app-border bg-[#f8f7f3]/92 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-7 dark:bg-app-page/92">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 rounded-lg border border-app-border bg-app-surface text-app-ink hover:bg-app-surface-muted" />
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
