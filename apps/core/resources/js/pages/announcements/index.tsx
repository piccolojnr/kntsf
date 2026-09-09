import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, FileText, Megaphone, Plus, Star } from 'lucide-react';
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
import { AnnouncementList } from '@/features/announcements/components/announcement-list';
import type {
    Announcement,
    AnnouncementPermissions,
    Paginated,
} from '@/features/announcements/types';
import {
    ContentPage,
    ContentToolbar,
    OverviewTile,
    RegistryPanel,
} from '@/features/content/components/content-admin-surface';
import { create, index } from '@/routes/announcements';

type Filters = {
    search: string;
    status: string;
};

export default function AnnouncementsIndex({
    announcements,
    filters,
    overview,
    can,
}: {
    announcements: Paginated<Announcement>;
    filters: Filters;
    overview: {
        total: number;
        draft: number;
        published: number;
        featured: number;
    };
    can: AnnouncementPermissions;
}) {
    const [search, setSearch] = useState(filters.search);

    function applyFilters(nextFilters: Partial<Filters>) {
        router.get(
            index.url(),
            {
                search,
                status: filters.status,
                ...nextFilters,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <>
            <Head title="Announcements" />

            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Announcements"
                        description="Create, publish, and archive SRC communication posts."
                    />

                    <div className="flex flex-wrap gap-2">
                        <ExportMenu
                            resource="announcements"
                            filters={filters}
                        />
                        {can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus />
                                    New announcement
                                </Link>
                            </Button>
                        )}
                    </div>
                </ContentToolbar>

                <div className="grid gap-3 md:grid-cols-4">
                    <OverviewTile
                        label="Total"
                        value={overview.total}
                        icon={FileText}
                    />
                    <OverviewTile
                        label="Drafts"
                        value={overview.draft}
                        icon={Megaphone}
                    />
                    <OverviewTile
                        label="Published"
                        value={overview.published}
                        icon={BadgeCheck}
                    />
                    <OverviewTile
                        label="Featured"
                        value={overview.featured}
                        icon={Star}
                    />
                </div>

                <RegistryPanel
                    title="Announcement registry"
                    description="Internal management list for student-facing communication."
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
                                placeholder="Search announcements"
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
                                    <SelectItem value="scheduled">
                                        Scheduled
                                    </SelectItem>
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
                    <AnnouncementList announcements={announcements} can={can} />
                </RegistryPanel>
            </ContentPage>
        </>
    );
}

AnnouncementsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Announcements',
            href: index(),
        },
    ],
};
