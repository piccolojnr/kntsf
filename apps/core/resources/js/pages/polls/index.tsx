import { Head, Link, router } from '@inertiajs/react';
import { Archive, BadgeCheck, FileText, Plus, Vote } from 'lucide-react';
import { useState } from 'react';
import { ExportMenu } from '@/components/shared/export-menu';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ContentPage,
    ContentToolbar,
    OverviewTile,
    RegistryPanel,
} from '@/features/content/components/content-admin-surface';
import { PollList } from '@/features/polls/components/poll-list';
import type { Paginated, Poll, PollPermissions } from '@/features/polls/types';
import { create, index } from '@/routes/polls';

type Filters = { search: string; status: string };

export default function PollsIndex({
    polls,
    filters,
    overview,
    can,
}: {
    polls: Paginated<Poll>;
    filters: Filters;
    overview: {
        total: number;
        draft: number;
        published: number;
        archived: number;
    };
    can: PollPermissions;
}) {
    const [search, setSearch] = useState(filters.search);

    function applyFilters(nextFilters: Partial<Filters>) {
        router.get(
            index.url(),
            { search, status: filters.status, ...nextFilters },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Polls" />

            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Polls"
                        description="Create surveys and collect one vote per student."
                    />

                    <div className="flex flex-wrap gap-2">
                        <ExportMenu resource="polls" filters={filters} />
                        {can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus />
                                    New poll
                                </Link>
                            </Button>
                        )}
                    </div>
                </ContentToolbar>

                <div className="grid gap-3 md:grid-cols-4">
                    <OverviewTile
                        label="Total"
                        value={overview.total}
                        icon={Vote}
                    />
                    <OverviewTile
                        label="Drafts"
                        value={overview.draft}
                        icon={FileText}
                    />
                    <OverviewTile
                        label="Published"
                        value={overview.published}
                        icon={BadgeCheck}
                    />
                    <OverviewTile
                        label="Archived"
                        value={overview.archived}
                        icon={Archive}
                    />
                </div>

                <RegistryPanel
                    title="Poll registry"
                    description="Internal list of voting and survey polls."
                    filters={
                        <>
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        applyFilters({ search });
                                    }
                                }}
                                placeholder="Search polls"
                                className="w-full sm:w-64"
                            />
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) =>
                                    applyFilters({
                                        status: value === 'all' ? '' : value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </>
                    }
                >
                    <PollList polls={polls} can={can} />
                </RegistryPanel>
            </ContentPage>
        </>
    );
}

PollsIndex.layout = {
    breadcrumbs: [{ title: 'Polls', href: index() }],
};
