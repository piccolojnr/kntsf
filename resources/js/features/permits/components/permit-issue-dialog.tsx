import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { AcademicPeriodSearchSelector } from '@/components/shared/academic-period-search-selector';
import InputError from '@/components/shared/input-error';
import { StudentSearchSelector } from '@/components/shared/student-search-selector';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/permits';
import type { PermitOptions } from '../types';

export function PermitIssueDialog({
    options,
    trigger,
}: {
    options: PermitOptions;
    trigger?: ReactNode;
}) {
    const [open, setOpen] = useState(false);

    function closeDialog(nextOpen: boolean) {
        setOpen(nextOpen);
    }

    return (
        <Dialog open={open} onOpenChange={closeDialog}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        <Plus />
                        Issue permit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle>Issue permit</DialogTitle>
                <DialogDescription>
                    A permit code will be generated once and will not be stored
                    in plaintext.
                </DialogDescription>

                <Form
                    {...store.form()}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            {errors.permit && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                    {errors.permit}
                                </div>
                            )}

                            <StudentSearchSelector
                                students={options.students}
                                errors={errors}
                                showEmailInput
                            />

                            <AcademicPeriodSearchSelector
                                periods={options.academic_periods}
                                errors={errors}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="starts_at">Starts at</Label>
                                    <Input
                                        id="starts_at"
                                        name="starts_at"
                                        type="datetime-local"
                                        defaultValue={
                                            options.issue_defaults.starts_at
                                        }
                                    />
                                    <InputError message={errors.starts_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expires_at">Expires at</Label>
                                    <Input
                                        id="expires_at"
                                        name="expires_at"
                                        type="datetime-local"
                                        defaultValue={
                                            options.issue_defaults.expires_at
                                        }
                                    />
                                    <InputError message={errors.expires_at} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="amount_paid">Amount paid</Label>
                                <Input
                                    id="amount_paid"
                                    name="amount_paid"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={
                                        options.issue_defaults.amount_paid
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Currency: {options.issue_defaults.currency}
                                </p>
                                <InputError message={errors.amount_paid} />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => resetAndClearErrors()}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button disabled={processing}>Issue permit</Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
