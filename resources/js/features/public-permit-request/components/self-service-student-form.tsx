import InputError from '@/components/shared/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PublicPermitStudentOptions } from '../types';

export function SelfServiceStudentForm({
    options,
    errors = {},
}: {
    options: PublicPermitStudentOptions;
    errors?: Record<string, string | undefined>;
}) {
    return (
        <div className="public-sketch-card theme-surface relative overflow-hidden rounded-[1.15rem] border border-app-border p-5">
            <div
                className="public-notebook-grid pointer-events-none absolute inset-0 opacity-35"
                aria-hidden="true"
            />
            <div className="relative grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                    <p className="text-xs font-semibold tracking-[0.18em] text-app-red uppercase">
                        Student record not found
                    </p>
                    <h2 className="mt-2 text-xl leading-tight font-semibold tracking-[-0.02em] text-app-ink">
                        Add a review-ready record
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-app-muted">
                        Complete the required details exactly as they should
                        appear for SRC review. Payment can continue, but
                        issuance may wait for approval.
                    </p>
                </div>
                <Field id="name" label="Full name" error={errors.name} />
                <Field
                    id="email"
                    label="Email"
                    type="email"
                    error={errors.email}
                />
                <Field id="phone" label="Phone" error={errors.phone} />
                <div className="grid gap-2">
                    <Label htmlFor="course">Course</Label>
                    <Select name="course">
                        <SelectTrigger
                            id="course"
                            className="theme-surface-strong h-11 rounded-xl border-app-border"
                        >
                            <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.courses.map((course) => (
                                <SelectItem
                                    key={course.value}
                                    value={course.value}
                                >
                                    {course.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.course} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="level">Level</Label>
                    <Select name="level">
                        <SelectTrigger
                            id="level"
                            className="theme-surface-strong h-11 rounded-xl border-app-border"
                        >
                            <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.levels.map((level) => (
                                <SelectItem
                                    key={level.value}
                                    value={level.value}
                                >
                                    Level {level.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.level} />
                </div>
                <p className="rounded-[1rem] border border-app-brass/40 bg-app-brass/10 px-4 py-3 text-xs leading-5 text-app-ink md:col-span-2">
                    Use a reachable email and phone number. SRC may use them to
                    resolve review issues before issuing the permit.
                </p>
            </div>
        </div>
    );
}

function Field({
    id,
    label,
    type = 'text',
    placeholder,
    error,
}: {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                className="theme-surface-strong h-11 rounded-xl border-app-border"
            />
            <InputError message={error} />
        </div>
    );
}
