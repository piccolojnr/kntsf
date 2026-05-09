import { Form } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { activateAccount } from '@/routes/students';
import type { Student } from '../types';

export function StudentActivateAccountDialog({
    student,
    trigger,
}: {
    student: Student;
    trigger?: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const hasEmail = student.email !== null && student.email !== '';
    const isPending = student.account_status === 'pending_setup';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button size="sm" variant="secondary">
                        <KeyRound />
                        {isPending ? 'Resend setup' : 'Activate account'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {isPending ? 'Resend setup link?' : 'Activate account?'}
                </DialogTitle>
                <DialogDescription>
                    {hasEmail
                        ? `A setup-password link will be sent to ${student.email}.`
                        : 'Add an email address before activating this student account.'}
                </DialogDescription>

                <Form
                    {...activateAccount.form(student.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing, errors }) => (
                        <div className="space-y-4">
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button disabled={processing || !hasEmail}>
                                    {isPending
                                        ? 'Resend setup link'
                                        : 'Activate account'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
