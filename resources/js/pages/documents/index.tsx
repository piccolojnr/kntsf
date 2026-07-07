import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, FileText, FolderOpen, Plus, Star } from 'lucide-react';
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
import { DocumentList } from '@/features/documents/components/document-list';
import type {
    Document,
    DocumentPermissions,
    Paginated,
} from '@/features/documents/types';
import { create, index } from '@/routes/documents';

type Filters = {
    search: string;
    status: string;
};

export default function DocumentsIndex({
    documents,
    filters,
    overview,
    can,
}: {
    documents: Paginated<Document>;
    filters: Filters;
    overview: {
        total: number;
        draft: number;
        published: number;
        featured: number;
    };
    can: DocumentPermissions;
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
            <Head title="Documents" />

            <ContentPage>
                <ContentToolbar>
                    <Heading
                        title="Documents"
                        description="Upload, publish, and organize downloadable SRC documents."
                    />

                    {can.create && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New document
                            </Link>
                        </Button>
                    )}
                </ContentToolbar>

                <div className="grid gap-3 md:grid-cols-4">
                    <OverviewTile
                        label="Total"
                        value={overview.total}
                        icon={FolderOpen}
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
                        label="Featured"
                        value={overview.featured}
                        icon={Star}
                    />
                </div>

                <RegistryPanel
                    title="Document library"
                    description="Internal management list for downloadable files and guidelines."
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
                                placeholder="Search documents"
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
                    <DocumentList documents={documents} can={can} />
                </RegistryPanel>
            </ContentPage>
        </>
    );
}

DocumentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href: index(),
        },
    ],
};
