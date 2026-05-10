import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
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
import { AuditLogList } from '@/features/audit-logs/components/audit-log-list';
import type { AuditLog, Paginated } from '@/features/audit-logs/types';
import { index } from '@/routes/audit-logs';

type Filters = {
    event: string;
    actor: string;
    date_from: string;
    date_to: string;
    subject_type: string;
};

export default function AuditLogsIndex({
    logs,
    filters,
    events,
}: {
    logs: Paginated<AuditLog>;
    filters: Filters;
    events: string[];
}) {
    const [actor, setActor] = useState(filters.actor ?? '');
    const [event, setEvent] = useState(filters.event ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [subjectType, setSubjectType] = useState(filters.subject_type ?? '');

    function submit(submitEvent: FormEvent<HTMLFormElement>) {
        submitEvent.preventDefault();

        router.get(
            index.url(),
            {
                event: event || undefined,
                actor: actor || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                subject_type: subjectType || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilters() {
        setActor('');
        setEvent('');
        setDateFrom('');
        setDateTo('');
        setSubjectType('');
        router.get(index.url(), {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Audit Logs" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Audit Logs"
                    description="Review important system actions across students, permits, payments, NFC cards, and verification."
                />

                <Card className="gap-0 py-0">
                    <CardHeader className="py-4">
                        <CardTitle>Operational audit trail</CardTitle>
                        <CardDescription>
                            Filter by event, actor, date range, or subject type.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t py-4">
                        <form
                            onSubmit={submit}
                            className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                        >
                            <Select
                                name="event"
                                value={event}
                                onValueChange={setEvent}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All events" />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item.replaceAll('.', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={actor}
                                    onChange={(event) =>
                                        setActor(event.target.value)
                                    }
                                    className="pl-9"
                                    placeholder="Actor name or email"
                                />
                            </div>

                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(event.target.value)
                                }
                                aria-label="From date"
                            />

                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(event.target.value)
                                }
                                aria-label="To date"
                            />

                            <div className="flex gap-2">
                                <Input
                                    value={subjectType}
                                    onChange={(event) =>
                                        setSubjectType(event.target.value)
                                    }
                                    placeholder="Subject type"
                                />
                                <Button type="submit">Filter</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>

                        <AuditLogList logs={logs} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AuditLogsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Audit Logs',
            href: index(),
        },
    ],
};
