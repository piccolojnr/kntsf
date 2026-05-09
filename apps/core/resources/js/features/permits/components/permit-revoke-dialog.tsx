import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
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
import { Label } from '@/components/ui/label';
import { revoke } from '@/routes/permits';
import type { Permit } from '../types';

export function PermitRevokeDialog({
    permit,
    trigger,
}: {
    permit: Permit;
    trigger: ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Revoke permit?</DialogTitle>
                <DialogDescription>
                    This changes the permit status to revoked. This action can
                    not be repeated for the same permit.
                </DialogDescription>

                <Form
                    {...revoke.form(permit.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {errors.permit && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                    {errors.permit}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor={`revocation_reason_${permit.id}`}>
                                    Reason
                                </Label>
                                <textarea
                                    id={`revocation_reason_${permit.id}`}
                                    name="revocation_reason"
                                    className="min-h-24 w-full rounded-md border border-input bg-input/20 px-2 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                                    maxLength={1000}
                                    placeholder="Optional reason"
                                />
                                <InputError message={errors.revocation_reason} />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button variant="destructive" disabled={processing}>
                                    Revoke permit
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
