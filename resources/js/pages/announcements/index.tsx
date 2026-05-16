import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    overview: { total: number; draft: number; published: number; featured: number };
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Announcements"
                        description="Create, publish, and archive SRC communication posts."
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

                <div className="grid gap-3 md:grid-cols-4">
                    <OverviewTile label="Total" value={overview.total} />
                    <OverviewTile label="Drafts" value={overview.draft} />
                    <OverviewTile
                        label="Published"
                        value={overview.published}
                    />
                    <OverviewTile label="Featured" value={overview.featured} />
                </div>

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle>Announcement registry</CardTitle>
                                <CardDescription>
                                    Internal management list for student-facing
                                    communication.
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
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
                                            status:
                                                value === 'all' ? '' : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
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
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="border-t p-4">
                        <AnnouncementList
                            announcements={announcements}
                            can={can}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function OverviewTile({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
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
