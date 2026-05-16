import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cancel, markFailed, markSuccessful } from '@/routes/payments';
import type { Payment, PaymentOptions } from '../types';

type PaymentStatusDialogProps = {
    payment: Payment;
    action: 'success' | 'failed' | 'cancel';
    options: PaymentOptions;
    trigger: ReactNode;
};

export function PaymentStatusDialog({
    payment,
    action,
    options,
    trigger,
}: PaymentStatusDialogProps) {
    const [open, setOpen] = useState(false);
    const form =
        action === 'success'
            ? markSuccessful.form(payment.id)
            : action === 'failed'
              ? markFailed.form(payment.id)
              : cancel.form(payment.id);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>{title(action)}</DialogTitle>
                <DialogDescription>
                    Update payment {payment.reference}.
                </DialogDescription>

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <InputError message={errors.payment} />

                            {action === 'failed' && (
                                <div className="grid gap-2">
                                    <Label htmlFor={`failure_reason_${payment.id}`}>
                                        Failure reason
                                    </Label>
                                    <Input
                                        id={`failure_reason_${payment.id}`}
                                        name="failure_reason"
                                        maxLength={1000}
                                        required
                                    />
                                    <InputError message={errors.failure_reason} />
                                </div>
                            )}

                            {action === 'success' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`academic_period_id_${payment.id}`}>
                                            Academic period
                                        </Label>
                                        <Select name="academic_period_id">
                                            <SelectTrigger
                                                id={`academic_period_id_${payment.id}`}
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Use active period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {options.academic_periods.map((period) => (
                                                    <SelectItem
                                                        key={period.id}
                                                        value={period.id.toString()}
                                                    >
                                                        {period.label}
                                                        {period.is_active
                                                            ? ' (active)'
                                                            : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.academic_period_id} />
                                    </div>

                                    <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-3">
                                        <input
                                            type="hidden"
                                            name="issue_permit"
                                            value="0"
                                        />
                                        <Checkbox
                                            id={`issue_permit_${payment.id}`}
                                            name="issue_permit"
                                            value="1"
                                            disabled={payment.permit !== null}
                                        />
                                        <Label htmlFor={`issue_permit_${payment.id}`}>
                                            Issue permit after success
                                        </Label>
                                    </div>
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor={`notes_${payment.id}`}>Notes</Label>
                                <Input
                                    id={`notes_${payment.id}`}
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
                                <Button
                                    variant={action === 'failed' ? 'destructive' : 'default'}
                                    disabled={processing}
                                >
                                    {title(action)}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function title(action: PaymentStatusDialogProps['action']) {
    return {
        success: 'Mark successful',
        failed: 'Mark failed',
        cancel: 'Cancel payment',
    }[action];
}
