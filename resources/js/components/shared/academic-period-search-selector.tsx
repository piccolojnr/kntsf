import { useState } from 'react';
import InputError from '@/components/shared/input-error';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';

export type AcademicPeriodSelectorOption = {
    id: number;
    label: string;
    is_active: boolean;
};

type AcademicPeriodSearchSelectorProps = {
    periods: AcademicPeriodSelectorOption[];
    errors: Record<string, string | undefined>;
    id?: string;
    name?: string;
};

export function AcademicPeriodSearchSelector({
    periods,
    errors,
    id = 'academic_period_id',
    name = 'academic_period_id',
}: AcademicPeriodSearchSelectorProps) {
    const activePeriod = periods.find((period) => period.is_active);
    const [selectedPeriod, setSelectedPeriod] =
        useState<AcademicPeriodSelectorOption | null>(activePeriod ?? null);

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>Academic period</Label>
            <input
                type="hidden"
                name={name}
                value={selectedPeriod?.id.toString() ?? ''}
            />
            <Combobox
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
                itemToStringLabel={(period) => period.label}
                itemToStringValue={(period) => period.id.toString()}
                isItemEqualToValue={(item, value) => item.id === value.id}
            >
                <ComboboxInput
                    id={id}
                    placeholder="Search academic period"
                    showClear
                    className="w-full"
                />
                <ComboboxContent>
                    <ComboboxEmpty>No matching academic periods</ComboboxEmpty>
                    <ComboboxList>
                        {periods.map((period) => (
                            <ComboboxItem
                                key={period.id}
                                value={period}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium">
                                        {period.label}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {period.is_active
                                            ? 'Active period'
                                            : 'Inactive'}
                                    </span>
                                </span>
                            </ComboboxItem>
                        ))}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
            <InputError message={errors[name]} />
        </div>
    );
}
