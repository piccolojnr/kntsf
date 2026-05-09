import { Form } from '@inertiajs/react';
import { Search } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { studentNumber } from '@/routes/verification';

export function StudentNumberVerificationForm() {
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
                            <div className="grid gap-2">
                                <Label htmlFor="student_number">
                                    Student number
                                </Label>
                                <Input
                                    id="student_number"
                                    name="student_number"
                                    maxLength={50}
                                    placeholder="26102859"
                                    required
                                />
                                <InputError message={errors.student_number} />
                            </div>

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
