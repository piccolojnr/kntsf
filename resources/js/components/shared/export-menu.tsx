import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { show as exportShow } from '@/routes/admin-exports';

type ExportFilters = Record<string, boolean | number | string | null | undefined>;

export function ExportMenu({
    resource,
    filters,
}: {
    resource: string;
    filters?: ExportFilters;
}) {
    const query = Object.fromEntries(
        Object.entries(filters ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11">
                    <Download className="size-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a
                        href={exportShow.url(
                            { resource, format: 'excel' },
                            { query },
                        )}
                    >
                        <FileSpreadsheet className="size-4" />
                        Excel
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a
                        href={exportShow.url(
                            { resource, format: 'csv' },
                            { query },
                        )}
                    >
                        <FileText className="size-4" />
                        CSV
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
