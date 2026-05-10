import { useRef, useState } from 'react';
import InputError from '@/components/shared/input-error';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type StudentSelectorOption = {
    id: number;
    student_number: string;
    name: string | null;
    email: string | null;
    label: string;
};

type StudentSearchSelectorProps = {
    students: StudentSelectorOption[];
    errors: Record<string, string | undefined>;
    id?: string;
    studentFieldName?: string;
    valueField?: 'id' | 'student_number';
    emailFieldName?: string;
    showEmailInput?: boolean;
};

export function StudentSearchSelector({
    students,
    errors,
    id = 'student_id',
    studentFieldName = 'student_id',
    valueField = 'id',
    emailFieldName = 'student_email',
    showEmailInput = false,
}: StudentSearchSelectorProps) {
    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    const [selectedStudent, setSelectedStudent] =
        useState<StudentSelectorOption | null>(null);
    const [studentEmail, setStudentEmail] = useState('');

    function updateStudent(student: StudentSelectorOption | null) {
        setSelectedStudent(student);
        setStudentEmail(student?.email ?? '');
    }

    return (
        <div ref={portalContainerRef} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor={id}>Student</Label>
                <input
                    type="hidden"
                    name={studentFieldName}
                    value={
                        selectedStudent
                            ? selectedStudent[valueField].toString()
                            : ''
                    }
                />
                <Combobox
                    value={selectedStudent}
                    onValueChange={updateStudent}
                    itemToStringLabel={(student) => student.label}
                    itemToStringValue={(student) => student.id.toString()}
                    isItemEqualToValue={(item, value) => item.id === value.id}
                >
                    <ComboboxInput
                        id={id}
                        placeholder="Search by student number, name, or email"
                        showClear
                        className="w-full"
                    />
                    <ComboboxContent portalContainer={portalContainerRef}>
                        <ComboboxEmpty>No matching students</ComboboxEmpty>
                        <ComboboxList>
                            {students.map((student) => (
                                <ComboboxItem
                                    key={student.id}
                                    value={student}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">
                                            {student.label}
                                        </span>
                                        <span className="block truncate text-xs text-muted-foreground">
                                            {student.email ?? 'No email on record'}
                                        </span>
                                    </span>
                                </ComboboxItem>
                            ))}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                <InputError message={errors[studentFieldName]} />
            </div>

            {showEmailInput && (
                <div className="grid gap-2">
                    <Label htmlFor={emailFieldName}>Student email</Label>
                    <Input
                        id={emailFieldName}
                        name={emailFieldName}
                        type="email"
                        value={studentEmail}
                        onChange={(event) => setStudentEmail(event.target.value)}
                        placeholder="student@example.com"
                    />
                    <InputError message={errors[emailFieldName]} />
                </div>
            )}
        </div>
    );
}
