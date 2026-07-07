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
import { ExecutiveFormDialog } from '@/features/executives/components/executive-form-dialog';
import { ExecutiveList } from '@/features/executives/components/executive-list';
import type {
    Executive,
    ExecutiveOptions,
    Paginated,
} from '@/features/executives/types';
import { index } from '@/routes/executives';

export default function ExecutivesIndex({
    executives,
    filters,
    options,
    can,
}: {
    executives: Paginated<Executive>;
    filters: { search: string };
    options: ExecutiveOptions;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        activate: boolean;
    };
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get(
            index.url(),
            { search: search || undefined },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Executives" />

            <div className="app-page admin-page-reveal flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Executives"
                        description="Manage SRC executives, administrators, staff accounts, and public profile details."
                    />

                    {can.create && <ExecutiveFormDialog options={options} />}
                </div>

                <Card className="app-panel gap-0 overflow-hidden py-0">
                    <CardHeader className="py-4">
                        <p className="app-kicker">Directory</p>
                        <CardTitle className="mt-1">
                            Executive accounts
                        </CardTitle>
                        <CardDescription>
                            Search by name, email, position, or category.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t py-4">
                        <form
                            onSubmit={submit}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    className="pl-9"
                                    placeholder="Search executives"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="theme-primary-action"
                            >
                                Search
                            </Button>
                        </form>

                        <ExecutiveList
                            executives={executives}
                            options={options}
                            can={can}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ExecutivesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Executives',
            href: index(),
        },
    ],
};
