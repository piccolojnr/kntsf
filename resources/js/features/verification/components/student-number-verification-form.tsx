import { Form } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { StudentSearchSelector } from '@/components/shared/student-search-selector';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { studentNumber } from '@/routes/verification';
import type { VerificationOptions } from '../types';

export function StudentNumberVerificationForm({
    options,
}: {
    options: VerificationOptions;
}) {
    return (
        <Card className="gap-0 py-0">
            <CardHeader className="py-4">
                <CardTitle>Student number</CardTitle>
                <CardDescription>
                    Verify against the student record and current permit.
                </CardDescription>
            </CardHeader>
            <CardContent className="border-t py-4">
                <Form
                    {...studentNumber.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <StudentSearchSelector
                                id="student_number"
                                students={options.students}
                                errors={errors}
                                studentFieldName="student_number"
                                valueField="student_number"
                            />

                            <Button disabled={processing}>
                                <Search />
                                Verify student
                            </Button>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
