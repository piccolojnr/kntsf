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
import { Textarea } from '@/components/ui/textarea';
import { update as updatePosition } from '@/routes/election-positions';
import { store as storePosition } from '@/routes/elections/positions';
import type { Election, ElectionPosition } from '../types';

export function ElectionPositionFormDialog({
    election,
    position,
    trigger,
}: {
    election: Election;
    position?: ElectionPosition;
    trigger: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [closeAfterSave, setCloseAfterSave] = useState(true);
    const isEditing = position !== undefined;
    const form = isEditing
        ? updatePosition.form(position.id)
        : storePosition.form(election.id);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-5xl">
                <DialogTitle>
                    {isEditing ? 'Edit position' : 'Add election position'}
                </DialogTitle>
                <DialogDescription>
                    Create one contestable post. Candidates are added to each
                    position after the position is saved.
                </DialogDescription>

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    resetOnSuccess={!isEditing}
                    onSuccess={() => {
                        if (closeAfterSave) {
                            setOpen(false);
                        }
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
                                <div className="grid gap-2">
                                    <Label htmlFor={`position_title_${position?.id ?? 'new'}`}>
                                        Position title
                                    </Label>
                                    <Input
                                        id={`position_title_${position?.id ?? 'new'}`}
                                        name="title"
                                        defaultValue={position?.title ?? ''}
                                        required
                                        placeholder="SRC President"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`max_winners_${position?.id ?? 'new'}`}>
                                        Winners
                                    </Label>
                                    <Input
                                        id={`max_winners_${position?.id ?? 'new'}`}
                                        name="max_winners"
                                        type="number"
                                        min={1}
                                        defaultValue={position?.max_winners ?? 1}
                                        required
                                    />
                                    <InputError message={errors.max_winners} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor={`position_description_${position?.id ?? 'new'}`}>
                                        Description
                                    </Label>
                                    <Textarea
                                        id={`position_description_${position?.id ?? 'new'}`}
                                        name="description"
                                        defaultValue={position?.description ?? ''}
                                        rows={5}
                                        placeholder="Responsibilities, eligibility notes, or voting guidance for this position"
                                    />
                                    <InputError message={errors.description} />
                                </div>
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
                                {!isEditing && (
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                        onClick={() => setCloseAfterSave(false)}
                                    >
                                        Save and add another
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    onClick={() => setCloseAfterSave(true)}
                                >
                                    {isEditing ? 'Save changes' : 'Save position'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
