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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { replace } from '@/routes/nfc-cards';
import type { NfcCard } from '../types';

export function NfcCardReplaceDialog({
    card,
    trigger,
}: {
    card: NfcCard;
    trigger: ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Replace NFC card</DialogTitle>
                <DialogDescription>
                    The current active card will be marked as replaced.
                </DialogDescription>

                <Form
                    {...replace.form(card.id)}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor={`uid_${card.id}`}>New NFC UID</Label>
                                <Input
                                    id={`uid_${card.id}`}
                                    name="uid"
                                    maxLength={100}
                                    placeholder="04:A1:B2:C3:D4"
                                    required
                                />
                                <InputError message={errors.uid} />
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
                                <Button disabled={processing}>Replace card</Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
