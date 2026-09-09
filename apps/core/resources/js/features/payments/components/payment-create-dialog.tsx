import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AcademicPeriodSearchSelector } from '@/components/shared/academic-period-search-selector';
import InputError from '@/components/shared/input-error';
import { StudentSearchSelector } from '@/components/shared/student-search-selector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store } from '@/routes/payments';
import type { PaymentOptions } from '../types';

export function PaymentCreateDialog({ options }: { options: PaymentOptions }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus />
                    Create payment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Create manual payment</DialogTitle>
                <DialogDescription>
                    Record an offline payment and optionally issue a permit.
                </DialogDescription>

                <Form
                    {...store.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <InputError message={errors.payment} />

                            <StudentSearchSelector
                                students={options.students}
                                errors={errors}
                                showEmailInput
                            />

                            <div className="grid gap-4 md:grid-cols-[1fr_0.55fr]">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <InputError message={errors.amount} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        name="currency"
                                        maxLength={3}
                                        defaultValue="GHS"
                                    />
                                    <InputError message={errors.currency} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Initial status</Label>
                                <Select name="status" defaultValue="pending">
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <AcademicPeriodSearchSelector
                                periods={options.academic_periods}
                                errors={errors}
                            />

                            <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-3">
                                <input type="hidden" name="issue_permit" value="0" />
                                <Checkbox
                                    id="issue_permit"
                                    name="issue_permit"
                                    value="1"
                                />
                                <Label htmlFor="issue_permit">Issue permit if successful</Label>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    name="notes"
                                    maxLength={1000}
                                    placeholder="Optional internal note"
                                />
                                <InputError message={errors.notes} />
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
                                <Button disabled={processing}>Create payment</Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
