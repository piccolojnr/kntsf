import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, Clock, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
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
import { EventList } from '@/features/events/components/event-list';
import type {
    Event,
    EventPermissions,
    Paginated,
} from '@/features/events/types';
import { create, index } from '@/routes/events';

type Filters = {
    search: string;
    status: string;
};

export default function EventsIndex({
    events,
    filters,
    overview,
    can,
}: {
    events: Paginated<Event>;
    filters: Filters;
    overview: {
        total: number;
        draft: number;
        published: number;
        upcoming: number;
    };
    can: EventPermissions;
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
            <Head title="Events" />

            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Events"
                        description="Create, publish, and archive SRC event records."
                    />

                    {can.create && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New event
                            </Link>
                        </Button>
                    )}
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
                        icon={CalendarDays}
                    />
                    <OverviewTile
                        label="Published"
                        value={overview.published}
                        icon={BadgeCheck}
                    />
                    <OverviewTile
                        label="Upcoming"
                        value={overview.upcoming}
                        icon={Clock}
                    />
                </div>

                <RegistryPanel
                    title="Event registry"
                    description="Internal management list for SRC and student events."
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
                                placeholder="Search events"
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
                    <EventList events={events} can={can} />
                </RegistryPanel>
            </ContentPage>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: index(),
        },
    ],
};
