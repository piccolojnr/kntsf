import { router } from '@inertiajs/react';
import { CalendarRange, Filter } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type ReportFilters = {
    preset: string;
    start_date: string | null;
    end_date: string | null;
    year: number | null;
    academic_period_id: number | null;
    label: string;
};

export type ReportFilterOptions = {
    years: { key: number; label: string }[];
    academic_periods: {
        id: number;
        name: string;
        academic_year: string | null;
    }[];
};

type ReportScopeFilterProps = {
    filters: ReportFilters;
    filterOptions: ReportFilterOptions;
    routeUrl: string;
};

export function ReportScopeFilter({
    filters,
    filterOptions,
    routeUrl,
}: ReportScopeFilterProps) {
    const [period, setPeriod] = useState(filters.preset);
    const activeDetail =
        period === filters.preset
            ? filters.label
            : periodPreview(period, filters, filterOptions);

    function submit(form: HTMLFormElement) {
        router.get(routeUrl, filterFormQuery(new FormData(form), period), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <form
            className="flex flex-col gap-3 rounded-lg border border-app-border bg-app-surface p-3 shadow-[0_8px_24px_rgba(23,33,27,0.04)] md:flex-row md:items-end md:gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                submit(event.currentTarget);
            }}
        >
            <div className="flex items-center gap-3 border-b border-app-border px-1 pb-3 md:w-56 md:shrink-0 md:border-r md:border-b-0 md:pr-4 md:pb-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-app-surface-muted text-app-muted">
                    <Filter className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-app-muted">
                        Report scope
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-app-ink">
                        {activeDetail}
                    </p>
                </div>
            </div>

            <input type="hidden" name="period" value={period} />

            <label className="grid min-w-0 gap-1.5 md:w-40 md:shrink-0">
                <span className="text-xs font-semibold text-app-muted">
                    Period
                </span>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="h-10 rounded-md border-app-border bg-app-surface-muted text-sm font-semibold text-app-ink">
                        <SelectValue placeholder="Choose period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="current_month">
                            This month
                        </SelectItem>
                        <SelectItem value="current_year">This year</SelectItem>
                        <SelectItem value="year">Select year</SelectItem>
                        <SelectItem value="academic_period">
                            Academic year
                        </SelectItem>
                        <SelectItem value="custom">Date range</SelectItem>
                        <SelectItem value="all">All records</SelectItem>
                    </SelectContent>
                </Select>
            </label>

            <div className="grid min-w-0 gap-2 sm:grid-cols-2 md:w-64 md:shrink-0">
                {period === 'custom' && (
                    <>
                        <DateField
                            label="Start"
                            name="start_date"
                            value={filters.start_date}
                        />
                        <DateField
                            label="End"
                            name="end_date"
                            value={filters.end_date}
                        />
                    </>
                )}

                {period === 'year' && (
                    <SelectField label="Year">
                        <Select
                            name="year"
                            defaultValue={String(
                                filters.year ?? new Date().getFullYear(),
                            )}
                        >
                            <SelectTrigger className="h-10 rounded-md border-app-border bg-app-surface-muted text-sm font-semibold text-app-ink">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.years.map((year) => (
                                    <SelectItem
                                        key={year.key}
                                        value={String(year.key)}
                                    >
                                        {year.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </SelectField>
                )}

                {period === 'academic_period' && (
                    <SelectField label="Academic year">
                        <Select
                            name="academic_period_id"
                            defaultValue={String(
                                filters.academic_period_id ?? '',
                            )}
                        >
                            <SelectTrigger className="h-10 rounded-md border-app-border bg-app-surface-muted text-sm font-semibold text-app-ink">
                                <SelectValue placeholder="Active period" />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.academic_periods.map((item) => (
                                    <SelectItem
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </SelectField>
                )}

                {['current_month', 'current_year', 'all'].includes(period) && (
                    <div className="hidden min-h-10 items-center gap-2 rounded-md bg-app-surface-muted px-3 text-sm text-app-muted sm:flex">
                        <CalendarRange className="size-4 shrink-0" />
                        <span className="truncate">{activeDetail}</span>
                    </div>
                )}
            </div>

            <button
                type="submit"
                className="theme-primary-active h-10 rounded-md px-5 text-sm font-semibold transition hover:bg-app-red md:ml-auto"
            >
                Apply
            </button>
        </form>
    );
}

function DateField({
    label,
    name,
    value,
}: {
    label: string;
    name: string;
    value: string | null;
}) {
    return (
        <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold text-app-muted">
                {label}
            </span>
            <input
                name={name}
                type="date"
                defaultValue={value ?? ''}
                className="h-10 min-w-0 rounded-md border border-app-border bg-app-surface-muted px-2 text-sm font-semibold text-app-ink"
            />
        </label>
    );
}

function SelectField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold text-app-muted">
                {label}
            </span>
            {children}
        </label>
    );
}

function filterFormQuery(formData: FormData, selectedPeriod: string) {
    const query: Record<string, string | number> = {
        period: selectedPeriod,
    };

    if (selectedPeriod === 'custom') {
        query.start_date = String(formData.get('start_date') ?? '');
        query.end_date = String(formData.get('end_date') ?? '');
    }

    if (selectedPeriod === 'year' || selectedPeriod === 'current_year') {
        query.year = Number(formData.get('year') || new Date().getFullYear());
    }

    if (selectedPeriod === 'academic_period') {
        query.academic_period_id = Number(formData.get('academic_period_id'));
    }

    return query;
}

function periodPreview(
    period: string,
    filters: ReportFilters,
    filterOptions: ReportFilterOptions,
) {
    if (period === 'year') {
        return String(filters.year ?? new Date().getFullYear());
    }

    if (period === 'academic_period') {
        return (
            filterOptions.academic_periods.find(
                (item) => item.id === filters.academic_period_id,
            )?.name ?? 'Active academic period'
        );
    }

    if (period === 'custom') {
        return [
            filters.start_date ?? 'Start date',
            filters.end_date ?? 'End date',
        ].join(' - ');
    }

    return (
        {
            current_month: 'This month',
            current_year: 'This year',
            all: 'All records',
        }[period] ?? 'Report period'
    );
}
