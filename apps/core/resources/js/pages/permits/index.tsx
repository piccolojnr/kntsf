import { Head, router, usePage } from '@inertiajs/react';
import { BadgeCheck, CreditCard, Search, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import Heading from '@/components/shared/heading';
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
            { search: searchTerm || undefined, status: filters.status || undefined },
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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Permits"
                        description="Issue and manage student permits for academic periods."
                    />

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
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                        <p className="font-medium">Permit code generated</p>
                        <p className="mt-1">
                            Code: <span className="font-mono">{issuedPermitCode}</span>
                        </p>
                        <p className="mt-1 text-xs">
                            This code is shown once and is not stored in plaintext.
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

                <Card className="gap-0 py-0">
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
                    <CardContent className="space-y-4 border-t py-4">
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
                                        className="pl-9"
                                        placeholder="Search permits"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={filters.status === '' ? 'default' : 'outline'}
                                    onClick={() => filterStatus(undefined)}
                                >
                                    All
                                </Button>
                                {['active', 'revoked', 'expired'].map((status) => (
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
                                ))}
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
        <div className="flex items-center gap-3 rounded-md border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
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
