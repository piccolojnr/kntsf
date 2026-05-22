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
}: {
    options: PublicPermitStudentOptions;
}) {
    return (
        <div className="grid gap-4 rounded-md border border-app-border bg-app-surface-muted p-4 md:grid-cols-2">
            <div className="md:col-span-2">
                <p className="text-sm font-semibold text-app-ink">
                    Student record not found
                </p>
                <p className="mt-1 text-xs leading-5 text-app-muted">
                    Complete your details. Your record may require
                    administrative review after payment.
                </p>
            </div>
            <Field id="name" label="Full name" />
            <Field id="email" label="Email" type="email" />
            <Field id="phone" label="Phone" />
            <div className="grid gap-2">
                <Label htmlFor="course">Course</Label>
                <Select name="course">
                    <SelectTrigger id="course" className="h-10 bg-app-surface">
                        <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.courses.map((course) => (
                            <SelectItem key={course.value} value={course.value}>
                                {course.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Select name="level">
                    <SelectTrigger id="level" className="h-10 bg-app-surface">
                        <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.levels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                                Level {level.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

function Field({
    id,
    label,
    type = 'text',
    placeholder,
}: {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                className="h-10 bg-app-surface"
            />
        </div>
    );
}
