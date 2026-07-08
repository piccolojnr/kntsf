import { Head, router, usePage } from '@inertiajs/react';
import { BadgeCheck, CreditCard, Search, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import Heading from '@/components/shared/heading';
import { ExportMenu } from '@/components/shared/export-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PermitIssueDialog } from '@/features/permits/components/permit-issue-dialog';
import { PermitList } from '@/features/permits/components/permit-list';
import type {
    Paginated,
    Permit,
    PermitOptions,
    PermitPermissions,
} from '@/features/permits/types';
import { index } from '@/routes/permits';

export default function PermitsIndex({
    permits,
    filters,
    options,
    overview,
    issuedPermitCode,
    can,
}: {
    permits: Paginated<Permit>;
    filters: { search: string; status: string };
    options: PermitOptions;
    overview: { total: number; active: number; revoked: number };
    issuedPermitCode?: string | null;
    can: PermitPermissions;
}) {
    const { url } = usePage();
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const shouldOpenIssueDialog = useMemo(
        () => new URLSearchParams(url.split('?')[1] ?? '').has('issue'),
        [url],
    );

    function cleanIssueQuery() {
        const query = new URLSearchParams(url.split('?')[1] ?? '');
        query.delete('issue');

        router.get(
            `${index.url()}${query.size > 0 ? `?${query.toString()}` : ''}`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get(
            index.url(),
            {
                search: searchTerm || undefined,
                status: filters.status || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function filterStatus(status?: string) {
        router.get(
            index.url(),
            { search: searchTerm || undefined, status },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Permits" />

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel relative overflow-hidden p-5 md:p-6">
                    <div className="absolute right-6 bottom-6 size-24 rounded-full border border-dashed border-app-border opacity-70" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading
                            title="Permits"
                            description="Issue and manage student permits for academic periods."
                        />
                    </div>
                </div>

                {can.issue && shouldOpenIssueDialog && (
                    <PermitIssueDialog
                        key={url}
                        options={options}
                        defaultOpen
                        trigger={null}
                        onClose={cleanIssueQuery}
                    />
                )}

                {issuedPermitCode && (
                    <div className="rounded-2xl border border-app-brass/45 bg-app-brass/12 p-4 text-sm text-app-ink">
                        <p className="font-medium">Permit code generated</p>
                        <p className="mt-1">
                            Code:{' '}
                            <span className="font-mono">
                                {issuedPermitCode}
                            </span>
                        </p>
                        <p className="mt-1 text-xs">
                            This code is shown once and is not stored in
                            plaintext.
                        </p>
                    </div>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                    <OverviewTile
                        icon={CreditCard}
                        label="Total permits"
                        value={overview.total.toString()}
                    />
                    <OverviewTile
                        icon={BadgeCheck}
                        label="Active permits"
                        value={overview.active.toString()}
                    />
                    <OverviewTile
                        icon={ShieldCheck}
                        label="Revoked permits"
                        value={overview.revoked.toString()}
                    />
                </div>

                <Card className="app-panel gap-0 overflow-hidden py-0">
                    <CardHeader className="py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Permit registry</CardTitle>
                                <CardDescription>
                                    Search by student details or code last four.
                                </CardDescription>
                            </div>
                            <Badge variant="outline">
                                Plain codes are never stored
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t border-app-border py-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <form
                                onSubmit={submitSearch}
                                className="flex flex-1 flex-col gap-2 sm:flex-row"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        className="rounded-xl border-app-border bg-app-surface pl-9"
                                        placeholder="Search permits"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>

                            <div className="flex gap-2">
                                <ExportMenu
                                    resource="permits"
                                    filters={filters}
                                />
                                <Button
                                    size="sm"
                                    variant={
                                        filters.status === ''
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => filterStatus(undefined)}
                                >
                                    All
                                </Button>
                                {['active', 'revoked', 'expired'].map(
                                    (status) => (
                                        <Button
                                            key={status}
                                            size="sm"
                                            variant={
                                                filters.status === status
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() => filterStatus(status)}
                                        >
                                            {status}
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>

                        <PermitList permits={permits} can={can} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function OverviewTile({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof CreditCard;
    label: string;
    value: string;
}) {
    return (
        <div className="app-panel-muted flex items-center gap-3 p-4 transition duration-300 hover:-translate-y-0.5">
            <div className="theme-primary-active flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                    {label}
                </p>
                <p className="text-sm font-semibold text-app-ink">{value}</p>
            </div>
        </div>
    );
}

PermitsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Permits',
            href: index(),
        },
    ],
};
