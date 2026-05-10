import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
import { store } from '@/routes/nfc-cards';
import type { NfcCardOptions } from '../types';

export function NfcCardRegisterDialog({
    options,
}: {
    options: NfcCardOptions;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus />
                    Register card
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Register NFC card</DialogTitle>
                <DialogDescription>
                    Assign a card UID to a student. The raw UID is never stored.
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
                            <StudentSearchSelector
                                students={options.students}
                                errors={errors}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="uid">NFC UID</Label>
                                <Input
                                    id="uid"
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
                                <Button disabled={processing}>Register card</Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
